import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, startOfQuarter, endOfQuarter, subMonths, subYears, subQuarters } from 'date-fns';

const COMPARISON_PERIODS = [
  { value: 'month', label: 'Month vs Previous Month' },
  { value: 'quarter', label: 'Quarter vs Previous Quarter' },
  { value: 'year', label: 'Year vs Previous Year' }
];

export default function PeriodComparison({ transactions, categories, accounts }) {
  const [comparisonPeriod, setComparisonPeriod] = useState('month');

  const comparisonData = useMemo(() => {
    const now = new Date();
    let currentStart, currentEnd, previousStart, previousEnd, periodLabel;

    switch (comparisonPeriod) {
      case 'month':
        currentStart = startOfMonth(now);
        currentEnd = endOfMonth(now);
        const prevMonth = subMonths(now, 1);
        previousStart = startOfMonth(prevMonth);
        previousEnd = endOfMonth(prevMonth);
        periodLabel = 'Month';
        break;
      case 'quarter':
        currentStart = startOfQuarter(now);
        currentEnd = endOfQuarter(now);
        const prevQuarter = subQuarters(now, 1);
        previousStart = startOfQuarter(prevQuarter);
        previousEnd = endOfQuarter(prevQuarter);
        periodLabel = 'Quarter';
        break;
      case 'year':
        currentStart = startOfYear(now);
        currentEnd = endOfYear(now);
        const prevYear = subYears(now, 1);
        previousStart = startOfYear(prevYear);
        previousEnd = endOfYear(prevYear);
        periodLabel = 'Year';
        break;
    }

    const currentTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= currentStart && date <= currentEnd;
    });

    const previousTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= previousStart && date <= previousEnd;
    });

    const calculateMetrics = (transactionList) => {
      const income = transactionList
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount_eur || 0), 0);
      
      const expenses = transactionList
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount_eur || 0), 0);

      const savings = income - expenses;

      const categoryBreakdown = transactionList
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const category = categories.find(c => c.id === t.category_id);
          const categoryName = category?.name || 'Uncategorized';
          acc[categoryName] = (acc[categoryName] || 0) + (t.amount_eur || 0);
          return acc;
        }, {});

      return { income, expenses, savings, categoryBreakdown };
    };

    // Calculate net worth for current period end
    const currentNetWorth = accounts ? accounts.reduce((sum, acc) => {
      if (acc.type === 'loan' || acc.type === 'credit_card') {
        return sum - (acc.balance_eur || 0);
      }
      return sum + (acc.balance_eur || 0);
    }, 0) : 0;

    // Calculate net worth for previous period end
    // This is an approximation: current net worth minus current period savings
    const current = calculateMetrics(currentTransactions);
    const previous = calculateMetrics(previousTransactions);
    const previousNetWorth = currentNetWorth - current.savings;

    return {
      current,
      previous,
      currentNetWorth,
      previousNetWorth,
      periodLabel,
      currentStart,
      currentEnd,
      previousStart,
      previousEnd
    };
  }, [transactions, categories, accounts, comparisonPeriod]);

  const getChangeIndicator = (current, previous) => {
    if (previous === 0) return { percentage: 0, direction: 'neutral' };
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return {
      percentage: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  };

  const incomeChange = getChangeIndicator(comparisonData.current.income, comparisonData.previous.income);
  const expenseChange = getChangeIndicator(comparisonData.current.expenses, comparisonData.previous.expenses);
  const savingsChange = getChangeIndicator(comparisonData.current.savings, comparisonData.previous.savings);
  const netWorthChange = getChangeIndicator(comparisonData.currentNetWorth, comparisonData.previousNetWorth);

  return (
    <Card className="shadow-sm border-slate-200 bg-white/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Period Comparison
          </CardTitle>
          <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPARISON_PERIODS.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Income Comparison */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-800">Income</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Current {comparisonData.periodLabel}</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(comparisonData.current.income, 'EUR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Previous {comparisonData.periodLabel}</span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(comparisonData.previous.income, 'EUR')}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Change</span>
                <div className="flex items-center gap-1">
                  {incomeChange.direction === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                  {incomeChange.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  <span className={`text-sm font-medium ${
                    incomeChange.direction === 'up' ? 'text-emerald-600' : 
                    incomeChange.direction === 'down' ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {incomeChange.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Comparison */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-800">Expenses</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Current {comparisonData.periodLabel}</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(comparisonData.current.expenses, 'EUR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Previous {comparisonData.periodLabel}</span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(comparisonData.previous.expenses, 'EUR')}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Change</span>
                <div className="flex items-center gap-1">
                  {expenseChange.direction === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                  {expenseChange.direction === 'down' && <TrendingDown className="w-4 h-4 text-emerald-500" />}
                  <span className={`text-sm font-medium ${
                    expenseChange.direction === 'up' ? 'text-red-600' : 
                    expenseChange.direction === 'down' ? 'text-emerald-600' : 'text-slate-600'
                  }`}>
                    {expenseChange.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Comparison */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-800">Net Savings</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Current {comparisonData.periodLabel}</span>
                <span className={`font-semibold ${
                  comparisonData.current.savings >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {formatCurrency(comparisonData.current.savings, 'EUR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Previous {comparisonData.periodLabel}</span>
                <span className={`font-semibold ${
                  comparisonData.previous.savings >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {formatCurrency(comparisonData.previous.savings, 'EUR')}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Change</span>
                <div className="flex items-center gap-1">
                  {savingsChange.direction === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                  {savingsChange.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  <span className={`text-sm font-medium ${
                    savingsChange.direction === 'up' ? 'text-emerald-600' : 
                    savingsChange.direction === 'down' ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {savingsChange.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Worth Comparison */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-800">Net Worth</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Current</span>
                <span className={`font-semibold ${
                  comparisonData.currentNetWorth >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {formatCurrency(comparisonData.currentNetWorth, 'EUR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">End of Previous {comparisonData.periodLabel}</span>
                <span className={`font-semibold ${
                  comparisonData.previousNetWorth >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {formatCurrency(comparisonData.previousNetWorth, 'EUR')}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Change</span>
                <div className="flex items-center gap-1">
                  {netWorthChange.direction === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                  {netWorthChange.direction === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                  <span className={`text-sm font-medium ${
                    netWorthChange.direction === 'up' ? 'text-emerald-600' : 
                    netWorthChange.direction === 'down' ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {netWorthChange.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}