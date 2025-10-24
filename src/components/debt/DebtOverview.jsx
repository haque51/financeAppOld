import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, CreditCard, Percent, Calendar } from "lucide-react";
import { formatCurrency } from "../utils/CurrencyFormatter";

export default function DebtOverview({ debtAccounts, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="shadow-sm">
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

  const totalDebt = debtAccounts.reduce((sum, acc) => sum + (acc.balance_eur || 0), 0);
  const highestDebt = debtAccounts.reduce((max, acc) => 
    (acc.balance_eur || 0) > (max.balance_eur || 0) ? acc : max, debtAccounts[0] || {});
  const averageInterestRate = debtAccounts.length > 0 
    ? debtAccounts.reduce((sum, acc) => sum + (acc.interest_rate || 0), 0) / debtAccounts.length
    : 0;
  const totalMinimumPayments = debtAccounts.reduce((sum, acc) => sum + (acc.minimum_payment || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="shadow-sm border-slate-200 glass-effect">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Total Debt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt, 'EUR')}</p>
          <p className="text-sm text-slate-500 mt-1">{debtAccounts.length} active accounts</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 glass-effect">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Highest Debt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(highestDebt.balance_eur || 0, 'EUR')}
          </p>
          <p className="text-sm text-slate-500 mt-1 truncate">{highestDebt.name || 'N/A'}</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 glass-effect">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Avg. Interest Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-900">{averageInterestRate.toFixed(1)}%</p>
          <p className="text-sm text-slate-500 mt-1">Across all debt accounts</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 glass-effect">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Min. Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(totalMinimumPayments, 'EUR')}
          </p>
          <p className="text-sm text-slate-500 mt-1">Monthly total</p>
        </CardContent>
      </Card>
    </div>
  );
}
