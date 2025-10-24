import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FolderTree } from "lucide-react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export default function CategorySpendingChart({ transactions, categories, isLoading }) {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  
  const categorySpending = expenseTransactions.reduce((acc, transaction) => {
    const category = categories.find(c => c.id === transaction.category_id);
    const categoryName = category ? category.name : 'Uncategorized';
    
    acc[categoryName] = (acc[categoryName] || 0) + (transaction.amount_eur || 0);
    return acc;
  }, {});

  const data = Object.entries(categorySpending)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border-0 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-lg font-bold text-red-500">
            €{data.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
          <FolderTree className="w-5 h-5 text-gray-600" />
          Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoading && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <div className="text-center">
              <FolderTree className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No expense data for this month</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}