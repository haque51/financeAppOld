import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function BudgetSummary({ totalBudgeted, totalSpent }) {
  const totalRemaining = totalBudgeted - totalSpent;
  const overallProgress = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const isOverBudget = totalRemaining < 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="shadow-sm border-slate-200 bg-white/80">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Budgeted</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalBudgeted, 'EUR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white/80">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Spent</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalSpent, 'EUR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-sm border-slate-200 bg-white/80">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOverBudget ? 'bg-red-100' : 'bg-emerald-100'}`}>
                <Wallet className={`w-5 h-5 ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-600">Remaining</p>
                <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(totalRemaining, 'EUR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}