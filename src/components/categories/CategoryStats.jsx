import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderTree, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";

export default function CategoryStats({ categories, transactions, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const parentCategories = categories.filter(c => !c.parent_id);
  const totalParentCategories = parentCategories.length;
  
  const incomeCategories = categories.filter(c => c.type === 'income');
  const parentIncomeCategories = parentCategories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const parentExpenseCategories = parentCategories.filter(c => c.type === 'expense');
  const transferCategories = categories.filter(c => c.type === 'transfer');
  const parentTransferCategories = parentCategories.filter(c => c.type === 'transfer');

  // Find most used category
  const categoryUsage = categories.reduce((acc, category) => {
    const count = transactions.filter(t => 
      t.category_id === category.id || t.subcategory_id === category.id
    ).length;
    acc[category.id] = { category, count };
    return acc;
  }, {});

  const mostUsedCategory = Object.values(categoryUsage)
    .sort((a, b) => b.count - a.count)[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <FolderTree className="w-4 h-4" />
            Main Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-slate-900">{totalParentCategories}</p>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                {parentIncomeCategories.length} income
              </Badge>
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                {parentExpenseCategories.length} expense
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Expense Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-red-600">{parentExpenseCategories.length}</p>
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
              {expenseCategories.length - parentExpenseCategories.length} subs
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Income Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-emerald-600">{parentIncomeCategories.length}</p>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
              {incomeCategories.length - parentIncomeCategories.length} subs
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Most Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            {mostUsedCategory && mostUsedCategory.count > 0 ? (
              <>
                <p className="text-lg font-bold text-slate-900 truncate">
                  {mostUsedCategory.category.name}
                </p>
                <p className="text-sm text-slate-500">
                  {mostUsedCategory.count} transactions
                </p>
              </>
            ) : (
              <p className="text-slate-500 text-sm">No usage data</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}