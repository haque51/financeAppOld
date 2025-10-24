import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, TrendingDown, Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from "../utils/CurrencyFormatter";
import { format, addMonths } from "date-fns";

export default function DebtPayoffPlanCard({ plan, debtAccounts, onEdit, onDelete }) {
  const planDebtAccounts = (plan.debt_accounts || []).map(debtItem => {
    const account = debtAccounts.find(acc => acc.id === debtItem.account_id);
    return { ...debtItem, account };
  }).filter(item => item.account);

  const totalDebt = planDebtAccounts.reduce((sum, item) => sum + item.current_balance, 0);
  const totalMinPayments = planDebtAccounts.reduce((sum, item) => sum + item.minimum_payment, 0);
  const projectedPayoffDate = plan.projected_payoff_months 
    ? addMonths(new Date(), plan.projected_payoff_months)
    : null;

  const strategyLabels = {
    avalanche: "Avalanche (Highest Interest)",
    snowball: "Snowball (Lowest Balance)",
    custom: "Custom Order"
  };

  return (
    <Card className="shadow-sm border-slate-200 glass-effect hover:shadow-md transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">{plan.name}</CardTitle>
            <Badge variant="outline" className="mt-2">
              {strategyLabels[plan.strategy] || plan.strategy}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-500">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-500">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded-lg bg-red-50 border border-red-100">
            <TrendingDown className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <p className="font-semibold text-red-600">{formatCurrency(totalDebt, 'EUR')}</p>
            <p className="text-xs text-red-500">Total Debt</p>
          </div>
          <div className="p-3 rounded-lg bg-green-50 border border-green-100">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="font-semibold text-green-600">+{formatCurrency(plan.extra_monthly_payment || 0, 'EUR')}</p>
            <p className="text-xs text-green-500">Extra Payment</p>
          </div>
        </div>

        {plan.projected_payoff_months && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Debt-Free In:</span>
              <span className="font-bold text-blue-900">{plan.projected_payoff_months} months</span>
            </div>
            {projectedPayoffDate && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Calendar className="w-4 h-4" />
                <span>{format(projectedPayoffDate, 'MMMM yyyy')}</span>
              </div>
            )}
          </div>
        )}

        {plan.total_interest_saved > 0 && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-sm font-medium text-emerald-800 mb-1">Interest Savings:</p>
            <p className="font-bold text-emerald-900">{formatCurrency(plan.total_interest_saved, 'EUR')}</p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Included Accounts:</p>
          {planDebtAccounts.map((item, index) => (
            <div key={item.account_id} className="flex justify-between items-center text-sm">
              <span className="text-slate-600">{index + 1}. {item.account.name}</span>
              <span className="font-medium text-slate-900">{formatCurrency(item.current_balance, 'EUR')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}