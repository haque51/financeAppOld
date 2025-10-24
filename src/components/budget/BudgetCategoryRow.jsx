import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '../utils/CurrencyFormatter';

export default function BudgetCategoryRow({ name, budgeted, spent, remaining, onBudgetChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(budgeted);

  const handleBlur = () => {
    setIsEditing(false);
    if (Number(currentBudget) !== budgeted) {
      onBudgetChange(Number(currentBudget));
    }
  };

  const effectiveBudget = Number(currentBudget);
  const progress = effectiveBudget > 0 ? (spent / effectiveBudget) * 100 : 0;
  const isOverBudget = remaining < 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-4 hover:bg-slate-50/50">
      <div className="font-medium text-slate-800">{name}</div>
      
      <div className="md:col-span-1">
        {isEditing ? (
          <Input
            type="number"
            value={currentBudget}
            onChange={(e) => setCurrentBudget(e.target.value)}
            onBlur={handleBlur}
            onKeyPress={(e) => e.key === 'Enter' && handleBlur()}
            autoFocus
            className="h-9"
          />
        ) : (
          <div onClick={() => setIsEditing(true)} className="cursor-pointer p-2 rounded-md hover:bg-slate-100 text-right md:text-left">
            <span className="text-slate-600">{formatCurrency(budgeted, 'EUR', true)}</span>
          </div>
        )}
      </div>

      <div className="md:col-span-1 text-right md:text-left">
        <span className="text-slate-600">{formatCurrency(spent, 'EUR', true)}</span>
      </div>

      <div className="md:col-span-1">
        <div className="flex justify-between items-center mb-1">
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatCurrency(remaining, 'EUR', true)}
            </span>
            <span className="text-xs text-slate-500">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={Math.min(progress, 100)} className={isOverBudget ? '[&>div]:bg-red-500' : '[&>div]:bg-emerald-500'} />
      </div>
    </div>
  );
}

BudgetCategoryRow.Skeleton = function BudgetCategoryRowSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-5 w-20" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-2 w-full" />
            </div>
        </div>
    )
}
