import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Category, Transaction, Budget } from '@/api/entities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths, addMonths } from 'date-fns';
import { PiggyBank, ArrowLeft, ArrowRight } from 'lucide-react';
import BudgetCategoryRow from '../components/budget/BudgetCategoryRow';
import BudgetSummary from '../components/budget/BudgetSummary';
import { Button } from '@/components/ui/button';

export default function BudgetPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const monthString = useMemo(() => format(currentMonth, 'yyyy-MM'), [currentMonth]);

  const loadData = useCallback(async (user, month) => {
    setIsLoading(true);
    try {
      const [categoriesData, transactionsData, budgetsData] = await Promise.all([
        Category.filter({ created_by: user.email, type: 'expense', is_active: true }),
        Transaction.filter({
          created_by: user.email,
          type: 'expense',
          // A bit wider range to be safe with timezones
          date: { gte: format(subMonths(new Date(month), 1), 'yyyy-MM-01'), lte: format(addMonths(new Date(month), 1), 'yyyy-MM-dd') }
        }),
        Budget.filter({ created_by: user.email, month: format(month, 'yyyy-MM') })
      ]);

      setCategories(categoriesData.filter(c => !c.parent_id));
      setTransactions(transactionsData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error("Error loading budget data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        await loadData(user, currentMonth);
      } catch (e) {
        setIsLoading(false);
      }
    };
    init();
  }, [currentMonth, loadData]);

  const handleBudgetUpdate = async (categoryId, newAmount) => {
    const existingBudget = budgets.find(b => b.category_id === categoryId && b.month === monthString);
    const amount = Number(newAmount) || 0;

    try {
      if (existingBudget) {
        await Budget.update(existingBudget.id, { amount });
      } else {
        await Budget.create({
          month: monthString,
          category_id: categoryId,
          amount,
          created_by: currentUser.email,
        });
      }
      // Refresh budgets for the current month
      const updatedBudgets = await Budget.filter({ created_by: currentUser.email, month: monthString });
      setBudgets(updatedBudgets);
    } catch (error) {
      console.error("Failed to update budget:", error);
    }
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => addMonths(prev, offset));
  };
  
  const parentCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories]);

  const budgetData = useMemo(() => {
    return parentCategories.map(category => {
      const monthlyTransactions = transactions.filter(t => {
        return new Date(t.date).getUTCFullYear() === currentMonth.getUTCFullYear() &&
               new Date(t.date).getUTCMonth() === currentMonth.getUTCMonth();
      });

      const spent = monthlyTransactions
        .filter(t => t.category_id === category.id)
        .reduce((sum, t) => sum + (t.amount_eur || 0), 0);
      
      const budgetEntry = budgets.find(b => b.category_id === category.id);
      const budgeted = budgetEntry ? budgetEntry.amount : (category.budget_amount || 0);

      return {
        categoryId: category.id,
        name: category.name,
        budgeted,
        spent,
        remaining: budgeted - spent
      };
    });
  }, [parentCategories, transactions, budgets, currentMonth]);

  const totalBudgeted = budgetData.reduce((sum, d) => sum + d.budgeted, 0);
  const totalSpent = budgetData.reduce((sum, d) => sum + d.spent, 0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Monthly Budget</h1>
            <p className="text-slate-600 mt-1">Plan your spending and track your progress.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="text-lg font-semibold text-slate-800 w-40 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <BudgetSummary totalBudgeted={totalBudgeted} totalSpent={totalSpent} />

      <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-lg border border-slate-200">
        <div className="p-4 border-b">
            <h3 className="font-semibold text-slate-800">Expense Categories</h3>
        </div>
        <div className="divide-y divide-slate-100">
        {isLoading ? (
            Array.from({length: 5}).map((_, i) => <BudgetCategoryRow.Skeleton key={i} />)
        ) : (
            budgetData.map(data => (
                <BudgetCategoryRow 
                    key={data.categoryId}
                    name={data.name}
                    budgeted={data.budgeted}
                    spent={data.spent}
                    remaining={data.remaining}
                    onBudgetChange={(newAmount) => handleBudgetUpdate(data.categoryId, newAmount)}
                />
            ))
        )}
        </div>
      </div>
    </div>
  );
}