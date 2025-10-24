
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../utils/CurrencyFormatter';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-lg font-bold" style={{ color: data.payload.fill }}>
            {formatCurrency(data.value, 'EUR')}
          </p>
        </div>
      );
    }
    return null;
};

export default function ReportDisplay({ data, categories, isLoading }) {

  const expenseData = data.filter(t => t.type === 'expense');

  const spendingByCategory = expenseData.reduce((acc, transaction) => {
    const category = categories.find(c => c.id === transaction.category_id);
    const categoryName = category ? category.name : 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + (transaction.amount_eur || 0);
    return acc;
  }, {});

  const chartData = Object.entries(spendingByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const totalIncome = data.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount_eur || 0), 0);
  const totalExpense = expenseData.reduce((sum, t) => sum + (t.amount_eur || 0), 0);
  const netResult = totalIncome - totalExpense;

  if (isLoading) {
      return <Skeleton className="h-96 w-full" />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-sm border-slate-200 bg-white/80">
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600">Total Income</span>
                    <span className="font-bold text-lg text-emerald-600">{formatCurrency(totalIncome, 'EUR')}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600">Total Expense</span>
                    <span className="font-bold text-lg text-red-600">{formatCurrency(totalExpense, 'EUR')}</span>
                </div>
                 <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-medium text-slate-800">Net Result</span>
                    <span className={`font-bold text-lg ${netResult >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(netResult, 'EUR')}
                    </span>
                </div>
            </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 bg-white/80">
            <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : <p className="text-center text-slate-500 py-10">No expense data for this period.</p>}
            </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="shadow-sm border-slate-200 bg-white/80">
            <CardHeader><CardTitle>Filtered Transactions</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Payee</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Subcategory</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(t => {
                            const category = categories.find(c => c.id === t.category_id);
                            const subcategory = categories.find(c => c.id === t.subcategory_id);
                            const color = t.type === 'income' ? 'text-emerald-600' : 'text-red-600';
                            return (
                                <TableRow key={t.id}>
                                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{t.payee}</TableCell>
                                    <TableCell>{category?.name || 'Uncategorized'}</TableCell>
                                    <TableCell className="text-slate-500 text-sm">{subcategory?.name || '-'}</TableCell>
                                    <TableCell className={`text-right font-medium ${color}`}>
                                        {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount_eur, 'EUR')}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                {data.length === 0 && <p className="text-center text-slate-500 py-10">No transactions match your filters.</p>}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
