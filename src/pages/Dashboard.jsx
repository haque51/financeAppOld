
import React, { useState, useEffect, useCallback } from "react";
import { Account, Transaction, Category, User, RecurrentTransaction } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  DollarSign,
  Calendar,
  ArrowRight
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, addDays, addWeeks, addMonths as addMonthsDateFns, addYears } from "date-fns";

import StatsCards from "../components/dashboard/StatsCards";
import IncomeExpenseChart from "../components/dashboard/IncomeExpenseChart";
import CategorySpendingChart from "../components/dashboard/CategorySpendingChart";
import MonthlyTrendChart from "../components/dashboard/MonthlyTrendChart";
import NetWorthChart from "../components/dashboard/NetWorthChart";
import { formatCurrency, formatNumber } from "../components/utils/CurrencyFormatter";
import BreakdownDialog from "../components/dashboard/BreakdownDialog";

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState({ USD: 0.92, BDT: 0.0084, EUR: 1 }); // Default rates, EUR is 1
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState({ title: '', data: [], total: 0, notes: '' });

  // This function now accepts 'rates' as an argument and handles batching of updates
  const processRecurringTransactions = async (user, rates) => {
    // Check if we've already processed recurring transactions today for this user
    const today = format(new Date(), 'yyyy-MM-dd');
    const localStorageKey = `lastRecurringProcessed_${user.email}`;
    const lastProcessed = localStorage.getItem(localStorageKey);
    
    if (lastProcessed === today) {
      console.log('Recurring transactions already processed today for this user.');
      return; // Skip processing if already done today
    }

    try {
      await delay(500); // Add delay before fetching recurring transactions
      const recurring = await RecurrentTransaction.filter({ created_by: user.email, is_active: true });
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      await delay(500); // Add delay before fetching accounts
      // Fetch all accounts for balance updates, creating a mutable copy for in-memory updates
      const allAccounts = await Account.filter({ created_by: user.email });
      const accountsMap = new Map(allAccounts.map(acc => [acc.id, { ...acc }])); // Create mutable copies

      let hasProcessedAny = false;
      let transactionsToCreate = [];
      let accountsToUpdate = new Map(); // Store account updates to batch
      let recurrentTxUpdates = []; // Store recurrent transaction updates

      for (const rt of recurring) {
        let next_due = new Date(rt.next_due_date);
        next_due.setHours(0,0,0,0);

        let updatedNextDueDate = null; // Track the latest next_due_date for this recurring transaction

        while (next_due <= todayDate) {
          hasProcessedAny = true;
          
          if (rt.end_date && next_due > new Date(rt.end_date)) {
            // If the end date is passed, add to recurrentTxUpdates to deactivate it
            recurrentTxUpdates.push({ id: rt.id, updateData: { is_active: false } });
            break; // Stop processing this recurring transaction
          }

          // Get the exchange rate for the transaction's currency
          const transactionCurrencyRateToEur = rates[rt.currency] || 1;

          // Prepare transaction for creation
          transactionsToCreate.push({
              date: format(next_due, 'yyyy-MM-dd'),
              account_id: rt.account_id,
              type: rt.type,
              payee: rt.payee,
              category_id: rt.category_id,
              subcategory_id: rt.subcategory_id,
              amount: rt.amount,
              currency: rt.currency,
              memo: `Recurring: ${rt.name}`,
              to_account_id: rt.to_account_id,
              created_by: user.email,
              amount_eur: rt.amount * transactionCurrencyRateToEur,
              exchange_rate: transactionCurrencyRateToEur
          });

          // Update account balances in the local map (mutable copy)
          const fromAccount = accountsMap.get(rt.account_id);
          const toAccount = rt.to_account_id ? accountsMap.get(rt.to_account_id) : null;

          if (fromAccount) {
            const isFromAccountDebt = fromAccount.type === 'loan' || fromAccount.type === 'credit_card';
            
            let amountInFromAccountCurrency = rt.amount;
            if (fromAccount.currency !== rt.currency) {
              const amountInEur = rt.amount * transactionCurrencyRateToEur;
              const eurToFromAccountRate = fromAccount.currency === 'EUR' ? 1 : (1 / (rates[fromAccount.currency] || 1));
              amountInFromAccountCurrency = amountInEur * eurToFromAccountRate;
            }

            let newBalance = fromAccount.balance;
            if (rt.type === 'income') {
              newBalance = isFromAccountDebt 
                ? fromAccount.balance - amountInFromAccountCurrency
                : fromAccount.balance + amountInFromAccountCurrency;
            } else if (rt.type === 'expense') {
              newBalance = isFromAccountDebt
                ? fromAccount.balance + amountInFromAccountCurrency
                : fromAccount.balance - amountInFromAccountCurrency;
            } else if (rt.type === 'transfer') {
              newBalance = isFromAccountDebt
                ? fromAccount.balance + amountInFromAccountCurrency
                : fromAccount.balance - amountInFromAccountCurrency;
            }

            fromAccount.balance = newBalance; // Update mutable copy
            fromAccount.balance_eur = newBalance * (rates[fromAccount.currency] || 1); // Update mutable copy
            accountsToUpdate.set(fromAccount.id, { balance: fromAccount.balance, balance_eur: fromAccount.balance_eur });
          }

          if (rt.type === 'transfer' && toAccount) {
            const isToAccountDebt = toAccount.type === 'loan' || toAccount.type === 'credit_card';
            
            let amountInToAccountCurrency = rt.amount;
            if (toAccount.currency !== rt.currency) {
              const amountInEur = rt.amount * transactionCurrencyRateToEur;
              const eurToToAccountRate = toAccount.currency === 'EUR' ? 1 : (1 / (rates[toAccount.currency] || 1));
              amountInToAccountCurrency = amountInEur * eurToToAccountRate;
            }

            const newToBalance = isToAccountDebt
              ? toAccount.balance - amountInToAccountCurrency
              : toAccount.balance + amountInToAccountCurrency;

            toAccount.balance = newToBalance; // Update mutable copy
            toAccount.balance_eur = newToBalance * (rates[toAccount.currency] || 1); // Update mutable copy
            accountsToUpdate.set(toAccount.id, { balance: toAccount.balance, balance_eur: toAccount.balance_eur });
          }

          // Calculate next due date
          let new_next_due = next_due;
          const interval = rt.interval || 1;
          if (rt.frequency === 'daily') new_next_due = addDays(new_next_due, interval);
          else if (rt.frequency === 'weekly') new_next_due = addWeeks(new_next_due, interval);
          else if (rt.frequency === 'monthly') new_next_due = addMonthsDateFns(new_next_due, interval);
          else if (rt.frequency === 'yearly') new_next_due = addYears(new_next_due, interval);
          else {
            console.warn(`Unknown frequency for recurrent transaction ${rt.id}: ${rt.frequency}`);
            break;
          }

          next_due = new_next_due;
          updatedNextDueDate = format(next_due, 'yyyy-MM-dd'); // Store the latest calculated next_due_date
        }

        // Add the recurring transaction's next_due_date update to the batch
        if (updatedNextDueDate) {
            recurrentTxUpdates.push({ id: rt.id, updateData: { next_due_date: updatedNextDueDate } });
        }
      }

      // Perform all accumulated transaction creations, account balance updates, and recurrent transaction updates sequentially with delays
      for (const transaction of transactionsToCreate) {
        await delay(300);
        await Transaction.create(transaction);
      }
      
      for (const [accountId, updateData] of accountsToUpdate.entries()) {
        await delay(300);
        await Account.update(accountId, updateData);
      }

      for (const { id, updateData } of recurrentTxUpdates) {
        await delay(300);
        await RecurrentTransaction.update(id, updateData);
      }

      // Only mark as processed if we actually processed something or checked all recurring transactions
      if (hasProcessedAny || recurring.length > 0) {
        localStorage.setItem(localStorageKey, today);
      }
    } catch (error) {
      console.error('Error processing recurring transactions:', error);
      // Don't set the localStorage flag if there was an error, so it can retry later
      throw error; // Re-throw to allow useEffect's catch block to handle rate limiting
    }
  };

  // This function now returns the rates instead of setting state directly
  const fetchExchangeRates = async () => {
    const localStorageKey = 'exchangeRatesCache';
    const lastFetchedKey = 'lastExchangeRateFetch';
    
    // Check if we've fetched rates recently (within last hour)
    const lastFetched = localStorage.getItem(lastFetchedKey);
    const cachedRates = localStorage.getItem(localStorageKey);
    
    if (lastFetched && cachedRates) {
      const hoursSinceLastFetch = (Date.now() - parseInt(lastFetched)) / (1000 * 60 * 60);
      if (hoursSinceLastFetch < 1) { // Cache for 1 hour
        // Use cached rates
        return JSON.parse(cachedRates);
      }
    }

    try {
      const result = await InvokeLLM({
        prompt: "Get current exchange rates for USD to EUR and BDT to EUR. Return only the current rates.",
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            USD_to_EUR: { type: "number" },
            BDT_to_EUR: { type: "number" }
          }
        }
      });

      if (result.USD_to_EUR && result.BDT_to_EUR) {
        const newRates = {
          USD: result.USD_to_EUR,
          BDT: result.BDT_to_EUR,
          EUR: 1 // Explicitly set EUR to EUR rate as 1
        };
        
        // Cache the rates
        localStorage.setItem(localStorageKey, JSON.stringify(newRates));
        localStorage.setItem(lastFetchedKey, Date.now().toString());
        return newRates;
      }
    } catch (error) {
      console.warn('Could not fetch live rates, using defaults', error);
      // Don't re-throw, use default rates. If LLM call fails, we still want to load other data.
    }
    
    // Return default rates if fetching fails
    return { USD: 0.92, BDT: 0.0084, EUR: 1 };
  };

  // Effect for initial load (fetch rates, load all data including recurring processing)
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted components
    
    const init = async () => {
      setIsLoading(true);
      try {
        // Add initial delay to prevent immediate burst of requests on page load
        await delay(1000);
        
        const user = await User.me();
        if (!isMounted) return;
        setCurrentUser(user);

        await delay(500); // Delay before fetching exchange rates
        const rates = await fetchExchangeRates(); // Fetch rates
        if (!isMounted) return;
        setExchangeRates(rates); // Update state with fetched rates

        // Process recurring transactions
        await processRecurringTransactions(user, rates);
        if (!isMounted) return;

        // Filter all data by current user concurrently, but with delays between different entity fetches
        await delay(500); // Delay before fetching accounts
        const accountsData = await Account.filter({ created_by: user.email }, '-updated_date');
        if (!isMounted) return;
        
        await delay(500); // Delay before fetching transactions
        const transactionsData = await Transaction.filter({ created_by: user.email }, '-date');
        if (!isMounted) return;
        
        await delay(500); // Delay before fetching categories
        const categoriesData = await Category.filter({ created_by: user.email }, '-created_date');
        if (!isMounted) return;

        setAccounts(accountsData);
        setTransactions(transactionsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Implement rate limiting retry logic
        if (error.response?.status === 429) {
          console.warn("Rate limit hit. Retrying in 5 seconds...");
          await delay(5000); // Wait for 5 seconds
          if (isMounted) {
            window.location.reload(); // Reload the page to retry initial data fetch
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    init();
    
    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this effect runs only once on mount

  // No separate effect needed for currentMonth changes.
  // The data (transactions, accounts) is loaded once.
  // Filtering based on currentMonth happens in derived state/variables below.

  const monthStart = startOfMonth(new Date(currentMonth));
  const monthEnd = endOfMonth(new Date(currentMonth));

  const prevMonthDate = subMonths(new Date(currentMonth), 1);
  const prevMonthStart = startOfMonth(prevMonthDate);
  const prevMonthEnd = endOfMonth(prevMonthDate);

  const currentMonthTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate >= monthStart && transDate <= monthEnd;
  });

  const prevMonthTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate >= prevMonthStart && transDate <= prevMonthEnd;
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

  const prevMonthIncome = prevMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

  const prevMonthExpenses = prevMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  const prevMonthSavings = prevMonthIncome - prevMonthExpenses;

  const incomeChange = monthlyIncome - prevMonthIncome;
  const incomePercentChange = prevMonthIncome > 0 ? (incomeChange / prevMonthIncome) * 100 : (monthlyIncome > 0 ? 100 : 0);

  const expenseChange = monthlyExpenses - prevMonthExpenses;
  const expensePercentChange = prevMonthExpenses > 0 ? (expenseChange / prevMonthExpenses) * 100 : (monthlyExpenses > 0 ? 100 : 0);

  const savingsChange = monthlySavings - prevMonthSavings;
  const savingsPercentChange = prevMonthSavings !== 0 ? (savingsChange / Math.abs(prevMonthSavings)) * 100 : (monthlySavings !== 0 ? 100 : 0);

  // Calculate current net worth based on actual account balances
  const currentNetWorth = accounts.reduce((sum, acc) => {
    if (acc.type === 'loan' || acc.type === 'credit_card') {
      return sum - (acc.balance_eur || 0);
    }
    return sum + (acc.balance_eur || 0);
  }, 0);

  // Get all transactions that happened AFTER the selected month end
  const transactionsAfterMonth = transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate > monthEnd;
  });

  // Calculate the net impact of transactions after the selected month
  // We need to reverse their effect to get the historical balance
  const netImpactAfterMonth = transactionsAfterMonth.reduce((impact, t) => {
    const fromAccount = accounts.find(a => a.id === t.account_id);
    const toAccount = t.to_account_id ? accounts.find(a => a.id === t.to_account_id) : null;
    const isFromDebt = fromAccount && (fromAccount.type === 'loan' || fromAccount.type === 'credit_card');
    const isToDebt = toAccount && (toAccount.type === 'loan' || toAccount.type === 'credit_card');

    if (t.type === 'income') {
      // Income increases net worth (increases assets or decreases debt)
      return impact + (t.amount_eur || 0);
    } else if (t.type === 'expense') {
      // Expense decreases net worth (decreases assets or increases debt)
      return impact - (t.amount_eur || 0);
    } else if (t.type === 'transfer') {
      // Transfers between accounts don't change net worth overall
      // But if transferring TO a debt account (payment), it reduces debt (increases net worth)
      // If transferring FROM a debt account (cash advance), it increases debt (decreases net worth)
      if (isFromDebt && !isToDebt) {
        // Taking money from debt (like cash advance) - decreases net worth
        return impact - (t.amount_eur || 0);
      } else if (!isFromDebt && isToDebt) {
        // Paying off debt - increases net worth
        return impact + (t.amount_eur || 0);
      }
      // Otherwise, no net worth change (both assets or both debts)
      return impact;
    }
    return impact;
  }, 0);

  // Historical net worth for the selected month = current net worth - impact of transactions after selected month
  const totalNetWorth = currentNetWorth - netImpactAfterMonth;

  // Calculate previous month's net worth similarly
  const transactionsAfterPrevMonth = transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate > prevMonthEnd;
  });

  const netImpactAfterPrevMonth = transactionsAfterPrevMonth.reduce((impact, t) => {
    const fromAccount = accounts.find(a => a.id === t.account_id);
    const toAccount = t.to_account_id ? accounts.find(a => a.id === t.to_account_id) : null;
    const isFromDebt = fromAccount && (fromAccount.type === 'loan' || fromAccount.type === 'credit_card');
    const isToDebt = toAccount && (toAccount.type === 'loan' || toAccount.type === 'credit_card');

    if (t.type === 'income') {
      return impact + (t.amount_eur || 0);
    } else if (t.type === 'expense') {
      return impact - (t.amount_eur || 0);
    } else if (t.type === 'transfer') {
      if (isFromDebt && !isToDebt) {
        return impact - (t.amount_eur || 0);
      } else if (!isFromDebt && isToDebt) {
        return impact + (t.amount_eur || 0);
      }
      return impact;
    }
    return impact;
  }, 0);

  const prevMonthNetWorth = currentNetWorth - netImpactAfterPrevMonth;

  const netWorthChange = totalNetWorth - prevMonthNetWorth;
  const netWorthPercentChange = prevMonthNetWorth !== 0 ? (netWorthChange / Math.abs(prevMonthNetWorth)) * 100 : (totalNetWorth !== 0 ? 100 : 0);

  // --- Breakdown Handlers ---
  const showIncomeBreakdown = () => {
    setBreakdownData({
      title: 'Monthly Income Breakdown',
      data: currentMonthTransactions
        .filter(t => t.type === 'income')
        .map(t => ({ label: t.payee || 'Income', value: t.amount_eur || 0 })),
      total: monthlyIncome,
      notes: 'This shows your income sources for the selected month.'
    });
    setIsBreakdownOpen(true);
  };

  const showExpenseBreakdown = () => {
    setBreakdownData({
      title: 'Monthly Expenses Breakdown',
      data: currentMonthTransactions
        .filter(t => t.type === 'expense')
        .map(t => ({ label: t.payee || 'Expense', value: t.amount_eur || 0 })),
      total: monthlyExpenses,
      notes: 'This shows your expense details for the selected month.'
    });
    setIsBreakdownOpen(true);
  };
  
  const showNetWorthBreakdown = () => {
    // To show breakdown for the historical net worth, we would need to calculate historical balances for each account.
    // For simplicity, this breakdown currently shows current balances.
    // A more complex implementation would calculate account balances as of monthEnd.
    setBreakdownData({
      title: `Net Worth Breakdown as of ${format(monthEnd, 'MMM dd, yyyy')}`,
      data: accounts.map(acc => {
        const isDebt = acc.type === 'loan' || acc.type === 'credit_card';
        // This is a simplified breakdown. For true historical breakdown per account,
        // we'd need to roll back transactions for each account.
        const effectiveBalance = isDebt ? -(acc.balance_eur || 0) : (acc.balance_eur || 0);
        return {
          label: acc.name,
          value: effectiveBalance,
        };
      }),
      total: totalNetWorth, // Display the calculated historical net worth
      notes: 'Liabilities (loans, credit cards) are deducted from net worth. This breakdown shows current account values, which may not perfectly sum to the historical net worth displayed due to transactions after the selected month end.'
    });
    setIsBreakdownOpen(true);
  };
  
  const showSavingsBreakdown = () => {
    setBreakdownData({
      title: 'Savings Rate Calculation',
      data: [
        { label: 'Total Income', value: monthlyIncome },
        { label: 'Total Expenses', value: -monthlyExpenses }, // Represent expenses as negative for clear calculation
      ],
      total: monthlySavings,
      notes: `Savings Rate (${savingsRate.toFixed(1)}%) = (Net Savings / Total Income) * 100.\nNet Savings = Total Income - Total Expenses.`
    });
    setIsBreakdownOpen(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-600 mt-2 font-medium">Track your financial progress</p>
        </div>
        <div className="flex gap-3">
          <Select value={currentMonth} onValueChange={setCurrentMonth}>
            <SelectTrigger className="w-40 border-gray-200 bg-white shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const value = format(date, 'yyyy-MM');
                return (
                  <SelectItem key={value} value={value}>
                    {format(date, 'MMMM yyyy')}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCards
          title="Monthly Income"
          value={formatCurrency(monthlyIncome, 'EUR', true, false)}
          icon={TrendingUp}
          bgColor="bg-emerald-500"
          trendValue={`${incomeChange >= 0 ? '+' : ''}${formatCurrency(incomeChange, 'EUR', true, false)} (${incomePercentChange >= 0 ? '+' : ''}${incomePercentChange.toFixed(0)}%)`}
          trendText="vs last month"
          trendDirection={incomeChange >= 0 ? 'up' : 'down'}
          onClick={showIncomeBreakdown}
        />
        <StatsCards
          title="Monthly Expenses"
          value={formatCurrency(monthlyExpenses, 'EUR', true, false)}
          icon={TrendingDown}
          bgColor="bg-red-500"
          trendValue={`${expenseChange >= 0 ? '+' : ''}${formatCurrency(expenseChange, 'EUR', true, false)} (${expensePercentChange >= 0 ? '+' : ''}${expensePercentChange.toFixed(0)}%)`}
          trendText="vs last month"
          trendDirection={expenseChange <= 0 ? 'up' : 'down'}
          onClick={showExpenseBreakdown}
        />
        <StatsCards
          title="Net Worth"
          value={formatCurrency(totalNetWorth, 'EUR', true, false)}
          icon={Wallet}
          bgColor="bg-blue-500"
          trendValue={`${netWorthChange >= 0 ? '+' : ''}${formatCurrency(netWorthChange, 'EUR', true, false)} (${netWorthPercentChange >= 0 ? '+' : ''}${netWorthPercentChange.toFixed(0)}%)`}
          trendText="vs last month"
          trendDirection={netWorthChange >= 0 ? 'up' : 'down'}
          onClick={showNetWorthBreakdown}
        />
        <StatsCards
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={PiggyBank}
          bgColor="bg-purple-500"
          trendValue={`${savingsChange >= 0 ? '+' : ''}${formatCurrency(savingsChange, 'EUR', true, false)} (${savingsPercentChange >= 0 ? '+' : ''}${savingsPercentChange.toFixed(0)}%)`}
          trendText="savings vs last month"
          trendDirection={savingsChange >= 0 ? 'up' : 'down'}
          onClick={showSavingsBreakdown}
        />
      </div>

      <BreakdownDialog
        open={isBreakdownOpen}
        onOpenChange={setIsBreakdownOpen}
        title={breakdownData.title}
        data={breakdownData.data}
        total={breakdownData.total}
        notes={breakdownData.notes}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <IncomeExpenseChart
          income={monthlyIncome}
          expenses={monthlyExpenses}
          isLoading={isLoading}
        />
        <CategorySpendingChart
          transactions={currentMonthTransactions}
          categories={categories}
          isLoading={isLoading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <MonthlyTrendChart
          transactions={transactions}
          isLoading={isLoading}
        />
        <NetWorthChart
          accounts={accounts}
          isLoading={isLoading}
        />
      </div>

      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
            <DollarSign className="w-5 h-5 text-gray-600" />
            Account Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => {
              const isDebtAccount = account.type === 'loan' || account.type === 'credit_card';
              const balanceShouldBeRed = isDebtAccount || (account.balance || 0) < 0;

              return (
                <div key={account.id} className="p-6 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{account.name}</h3>
                      <p className="text-sm text-gray-500 capitalize font-medium">{account.type.replace('_', ' ')}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-md border border-gray-200">
                      {account.currency}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className={`text-2xl font-bold ${
                      balanceShouldBeRed ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {formatCurrency(account.balance || 0, account.currency, true, false)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      ≈ €{formatNumber(account.balance_eur || 0, true)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
