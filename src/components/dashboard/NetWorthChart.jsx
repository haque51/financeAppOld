import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet } from "lucide-react";

export default function NetWorthChart({ accounts, isLoading }) {
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (!acc[type]) {
      acc[type] = 0;
    }
    
    // For debts, we want negative values
    if (account.type === 'loan' || account.type === 'credit_card') {
      acc[type] -= (account.balance_eur || 0);
    } else {
      acc[type] += (account.balance_eur || 0);
    }
    
    return acc;
  }, {});

  const data = Object.entries(accountsByType).map(([type, balance]) => ({
    type,
    balance: Math.round(balance),
    color: balance >= 0 ? '#10b981' : '#ef4444'
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-sm">
          <p className="font-medium">{label}</p>
          <p className={`text-lg font-bold ${value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            €{Math.abs(value).toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-slate-600" />
          Net Worth by Account Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoading && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="type" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="balance"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-slate-500">
            <div className="text-center">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No account data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}