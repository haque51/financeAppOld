
import React, { useState, useEffect, useCallback } from "react";
import { Account, Transaction, Category, User, TransactionTemplate } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Filter, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";

import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import TransactionFilters from "../components/transactions/TransactionFilters";
import { formatCurrency } from "../components/utils/CurrencyFormatter";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({ USD: 0.92, BDT: 0.0084, EUR: 1 });
  const [netWorth, setNetWorth] = useState(0);
  
  const [filters, setFilters] = useState({
    search: "",
    account: "all",
    type: "all",
    category: "all",
    dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    dateTo: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const fetchExchangeRates = useCallback(async () => {
    try {
      const result = await InvokeLLM({
        prompt: "Get current exchange rates for USD to EUR and BDT to EUR.",
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
        setExchangeRates({
          USD: result.USD_to_EUR,
          BDT: result.BDT_to_EUR,
          EUR: 1
        });
      }
    } catch (error) {
      console.warn("Could not fetch live rates, using defaults");
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [transactionsData, accountsData, categoriesData, templatesData] = await Promise.all([
        Transaction.filter({ created_by: user.email }, '-date'),
        Account.filter({ created_by: user.email }), // Fetch all accounts to avoid issues
        Category.filter({ created_by: user.email, is_active: true }),
        TransactionTemplate.filter({ created_by: user.email }),
      ]);
      
      setTransactions(transactionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.payee?.toLowerCase().includes(searchLower) ||
        t.memo?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.account !== "all") {
        filtered = filtered.filter(t => t.account_id === filters.account || t.to_account_id === filters.account);
    }

    if (filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.category !== "all") {
      filtered = filtered.filter(t => t.category_id === filters.category);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  // Effect to calculate Net Worth
  useEffect(() => {
    if (accounts.length > 0) {
      const calculatedNetWorth = accounts.reduce((sum, acc) => {
        // Debt accounts (loans, credit cards) are liabilities - subtract from net worth
        if (acc.type === 'loan' || acc.type === 'credit_card') {
          return sum - (acc.balance_eur || 0);
        }
        // All other account types (checking, savings, investment, brokerage, cash) are assets - add to net worth
        return sum + (acc.balance_eur || 0);
      }, 0);
      setNetWorth(calculatedNetWorth);
    } else {
      setNetWorth(0);
    }
  }, [accounts]);

  useEffect(() => {
    loadData();
    fetchExchangeRates();
  }, [loadData, fetchExchangeRates]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  // Centralized function to handle all balance updates
  const updateAccountBalances = useCallback(async (transaction, operation) => {
    if (!currentUser) {
      console.error("No current user found for balance update.");
      return;
    }
    
    // Multiplier is 1 for 'apply' (transaction affects balance normally)
    // Multiplier is -1 for 'revert' (undoing the transaction's effect)
    const multiplier = operation === 'apply' ? 1 : -1;
    
    // Helper to get amount in the target account's currency
    const getAmountInAccountCurrency = (trans, account, rates) => {
      if (!account || !trans) return 0; // Defensive check
      if (account.currency === trans.currency) {
          return trans.amount;
      }
      
      // Convert trans.amount (in trans.currency) to EUR
      const amountInEur = trans.amount * (rates[trans.currency] || 1);
      
      // Convert EUR to account.currency
      // Assuming rates[currency] stores currency_to_EUR. So EUR_to_Currency is 1 / currency_to_EUR.
      const eurToAccountRate = 1 / (rates[account.currency] || 1); 
      
      return amountInEur * eurToAccountRate;
    };

    // Fetch fresh account data to prevent stale data issues, especially during rapid updates
    const allAccounts = await Account.filter({ created_by: currentUser.email });

    const fromAccount = allAccounts.find(a => a.id === transaction.account_id);
    const toAccount = transaction.to_account_id ? allAccounts.find(a => a.id === transaction.to_account_id) : null;
    
    // Determine if the 'from' account is a debt-type account (loan/credit card)
    const isFromAccountDebt = fromAccount && (fromAccount.type === 'loan' || fromAccount.type === 'credit_card');

    // Handle the primary account (source) for the transaction
    if (fromAccount) {
        const amountInFromAccountCurrency = getAmountInAccountCurrency(transaction, fromAccount, exchangeRates);
        let newBalance;

        if (transaction.type === 'income') {
            // Income on a debt account (e.g., refund) reduces the balance owed.
            // Income on an asset account increases the balance.
            newBalance = isFromAccountDebt 
                ? fromAccount.balance - (amountInFromAccountCurrency * multiplier)
                : fromAccount.balance + (amountInFromAccountCurrency * multiplier);
        } else if (transaction.type === 'expense') {
            // Expense from a debt account (e.g., using a credit card) increases the balance owed.
            // Expense from an asset account decreases the balance.
            newBalance = isFromAccountDebt
                ? fromAccount.balance + (amountInFromAccountCurrency * multiplier)
                : fromAccount.balance - (amountInFromAccountCurrency * multiplier);
        } else if (transaction.type === 'transfer') {
            // Transfer FROM a debt account (e.g., cash advance from credit card) increases the balance owed.
            // Transfer FROM an asset account decreases the balance.
             newBalance = isFromAccountDebt
                ? fromAccount.balance + (amountInFromAccountCurrency * multiplier)
                : fromAccount.balance - (amountInFromAccountCurrency * multiplier);
        }

        if (newBalance !== undefined) {
            await Account.update(fromAccount.id, {
                balance: newBalance,
                // Update balance_eur based on the new native balance and current exchange rate of the account's currency to EUR
                balance_eur: newBalance * (exchangeRates[fromAccount.currency] || 1)
            });
        }
    }

    // Handle the destination account for transfers (if applicable)
    if (transaction.type === 'transfer' && toAccount) {
        const amountInToAccountCurrency = getAmountInAccountCurrency(transaction, toAccount, exchangeRates);
        // Determine if the 'to' account is a debt-type account
        const isToAccountDebt = toAccount.type === 'loan' || toAccount.type === 'credit_card';
        let newToBalance;
        
        // CRITICAL LOGIC FOR LOAN/DEBT ACCOUNTS:
        // When transferring TO a debt account (e.g., making a payment to a credit card or loan),
        // we REDUCE the balance owed (subtract the payment amount).
        // When transferring TO an asset account, we INCREASE its balance.
        newToBalance = isToAccountDebt
            ? toAccount.balance - (amountInToAccountCurrency * multiplier)
            : toAccount.balance + (amountInToAccountCurrency * multiplier);

        await Account.update(toAccount.id, {
            balance: newToBalance,
            balance_eur: newToBalance * (exchangeRates[toAccount.currency] || 1)
        });
    }
  }, [currentUser, exchangeRates]);

  const handleDelete = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction? This will also update the linked account balances.")) {
      try {
        const transactionToDelete = transactions.find(t => t.id === transactionId);
        if (!transactionToDelete) {
          console.warn(`Transaction with ID ${transactionId} not found for deletion.`);
          return;
        }

        // --- REVERT BALANCES FIRST ---
        // When reverting, we use 'revert' operation which uses multiplier = -1.
        // This effectively reverses the effect of the original transaction on account balances.
        await updateAccountBalances(transactionToDelete, 'revert');
        
        // --- DELETE TRANSACTION ---
        await Transaction.delete(transactionId);
        
        // --- RELOAD DATA ---
        // Ensure data is reloaded after successful deletion and balance update
        await loadData();
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Failed to delete transaction. Please check console for details. Account balances may not have been updated correctly.");
      }
    }
  };

  const handleSave = async (formData) => {
    if (!currentUser) {
      alert("Error: No user logged in. Please refresh.");
      return;
    }
    try {
      // --- REVERT OLD BALANCES IF EDITING ---
      // If we are editing an existing transaction, first revert its previous impact on balances.
      if (editingTransaction) {
        await updateAccountBalances(editingTransaction, 'revert');
      }

      // --- SAVE TRANSACTION DATA ---
      const rate = exchangeRates[formData.currency] || 1;
      const amountEur = formData.amount * rate;
      const dataToSave = {
        ...formData,
        amount_eur: amountEur,
        exchange_rate: rate,
        created_by: currentUser.email,
      };

      let savedTransactionResult;
      if (editingTransaction) {
        savedTransactionResult = await Transaction.update(editingTransaction.id, dataToSave);
      } else {
        savedTransactionResult = await Transaction.create(dataToSave);
      }
        
      // Ensure the transaction object passed to update balances is complete with its ID.
      // For new transactions, the ID comes from savedTransactionResult.
      // For edited transactions, merge existing with new data.
      const finalTransaction = editingTransaction
        ? { ...editingTransaction, ...dataToSave }
        : { ...dataToSave, id: savedTransactionResult.id };

      // --- APPLY NEW BALANCES ---
      // Apply the impact of the newly saved/updated transaction on balances.
      await updateAccountBalances(finalTransaction, 'apply');

      setIsFormOpen(false);
      setEditingTransaction(null);
      // Ensure data is reloaded after successful save and balance update
      await loadData();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction. Please check console for details. Account balances may not have been updated correctly.");
      // Reload data to potentially revert UI on failure and fetch latest state
      await loadData(); 
    }
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-1">Manage your income, expenses, and transfers</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              transaction={editingTransaction}
              accounts={accounts}
              categories={categories}
              templates={templates}
              exchangeRates={exchangeRates}
              onSubmit={handleSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200 bg-white/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalIncome, 'EUR', true, true)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 bg-white/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses, 'EUR', true, true)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 bg-white/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Net Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(netAmount, 'EUR', true, true)}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 bg-white/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(netWorth, 'EUR', true, true)}
            </p>
          </CardContent>
        </Card>
      </div>

      <TransactionFilters
        filters={filters}
        accounts={accounts}
        categories={categories}
        onFiltersChange={setFilters}
      />

      <TransactionList
        transactions={filteredTransactions}
        accounts={accounts}
        categories={categories}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
