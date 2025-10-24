
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "../utils/CurrencyFormatter";

export default function DebtPayoffPlanForm({ plan, debtAccounts, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    strategy: 'avalanche',
    extra_monthly_payment: 0,
    debt_accounts: []
  });

  const [calculation, setCalculation] = useState({
    projected_payoff_months: 0,
    total_interest_saved: 0
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        strategy: plan.strategy || 'avalanche',
        extra_monthly_payment: plan.extra_monthly_payment || 0,
        debt_accounts: plan.debt_accounts || []
      });
    } else {
      // Initialize with all debt accounts
      const initialDebtAccounts = debtAccounts.map(acc => ({
        account_id: acc.id,
        current_balance: acc.balance_eur || 0,
        interest_rate: acc.interest_rate || 18, // Default credit card rate
        minimum_payment: acc.minimum_payment || Math.max(25, acc.balance_eur * 0.02), // 2% minimum
        priority_order: 1
      }));
      setFormData(prev => ({ ...prev, debt_accounts: initialDebtAccounts }));
    }
  }, [plan, debtAccounts]);

  const calculatePayoffPlan = useCallback(() => {
    if (formData.debt_accounts.length === 0) return;

    const totalDebt = formData.debt_accounts.reduce((sum, item) => sum + item.current_balance, 0);
    const totalMinPayments = formData.debt_accounts.reduce((sum, item) => sum + item.minimum_payment, 0);
    const totalMonthlyPayment = totalMinPayments + formData.extra_monthly_payment;
    const averageInterestRate = formData.debt_accounts.reduce((sum, item) => sum + item.interest_rate, 0) / formData.debt_accounts.length / 100 / 12;

    // More accurate calculation using compound interest formula
    let monthsToPayoff = 0;
    let totalInterestWithPlan = 0;

    if (averageInterestRate > 0 && totalMonthlyPayment > totalDebt * averageInterestRate) {
      // Formula for compound interest payoff
      monthsToPayoff = Math.ceil(
        -Math.log(1 - (totalDebt * averageInterestRate) / totalMonthlyPayment) / 
        Math.log(1 + averageInterestRate)
      );
      totalInterestWithPlan = (totalMonthlyPayment * monthsToPayoff) - totalDebt;
    } else if (averageInterestRate === 0 && totalMonthlyPayment > 0) { // Check totalMonthlyPayment > 0 to avoid division by zero if no payment
      // No interest case
      monthsToPayoff = Math.ceil(totalDebt / totalMonthlyPayment);
      totalInterestWithPlan = 0;
    } else {
      // Edge case where payment doesn't cover interest or no payment at all
      monthsToPayoff = 0; // Represents inability to pay off
      totalInterestWithPlan = 0;
    }

    // Calculate with minimum payments only
    let monthsMinimumOnly = 0;
    let totalInterestMinimumOnly = 0;

    if (averageInterestRate > 0 && totalMinPayments > totalDebt * averageInterestRate) {
      monthsMinimumOnly = Math.ceil(
        -Math.log(1 - (totalDebt * averageInterestRate) / totalMinPayments) / 
        Math.log(1 + averageInterestRate)
      );
      totalInterestMinimumOnly = (totalMinPayments * monthsMinimumOnly) - totalDebt;
    } else if (averageInterestRate === 0 && totalMinPayments > 0) { // Check totalMinPayments > 0 to avoid division by zero if no minimum payment
      monthsMinimumOnly = Math.ceil(totalDebt / totalMinPayments);
      totalInterestMinimumOnly = 0;
    } else {
      // Edge case where minimum payment doesn't cover interest or no minimum payment
      monthsMinimumOnly = 0; // Represents inability to pay off
      totalInterestMinimumOnly = 0;
    }

    const interestSaved = Math.max(0, totalInterestMinimumOnly - totalInterestWithPlan);

    setCalculation({
      projected_payoff_months: isNaN(monthsToPayoff) || !isFinite(monthsToPayoff) ? 0 : monthsToPayoff,
      total_interest_saved: isNaN(interestSaved) || !isFinite(interestSaved) ? 0 : interestSaved
    });
  }, [formData]);

  useEffect(() => {
    calculatePayoffPlan();
  }, [calculatePayoffPlan]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDebtAccountChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      debt_accounts: prev.debt_accounts.map((item, i) => 
        i === index ? { ...item, [field]: Number(value) } : item
      )
    }));
  };

  const toggleDebtAccount = (accountId, checked) => {
    if (checked) {
      const account = debtAccounts.find(acc => acc.id === accountId);
      if (account) {
        const newItem = {
          account_id: accountId,
          current_balance: account.balance_eur || 0,
          interest_rate: account.interest_rate || 18,
          minimum_payment: account.minimum_payment || Math.max(25, account.balance_eur * 0.02),
          priority_order: formData.debt_accounts.length + 1
        };
        setFormData(prev => ({
          ...prev,
          debt_accounts: [...prev.debt_accounts, newItem]
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        debt_accounts: prev.debt_accounts.filter(item => item.account_id !== accountId)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      projected_payoff_months: calculation.projected_payoff_months,
      total_interest_saved: calculation.total_interest_saved
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Debt Freedom Plan"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="strategy">Payoff Strategy</Label>
          <Select value={formData.strategy} onValueChange={(value) => handleChange('strategy', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="avalanche">Avalanche (Highest Interest First)</SelectItem>
              <SelectItem value="snowball">Snowball (Smallest Balance First)</SelectItem>
              <SelectItem value="custom">Custom Order</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="extra_payment">Extra Monthly Payment (€)</Label>
        <Input
          id="extra_payment"
          type="number"
          value={formData.extra_monthly_payment}
          onChange={(e) => handleChange('extra_monthly_payment', Number(e.target.value))}
          placeholder="0"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Select Debt Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {debtAccounts.map((account) => {
            const isIncluded = formData.debt_accounts.some(item => item.account_id === account.id);
            const debtIndex = formData.debt_accounts.findIndex(item => item.account_id === account.id);
            
            return (
              <div key={account.id} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={account.id}
                    checked={isIncluded}
                    onCheckedChange={(checked) => toggleDebtAccount(account.id, checked)}
                  />
                  <label htmlFor={account.id} className="text-sm font-medium">
                    {account.name} - {formatCurrency(account.balance_eur || 0, 'EUR')}
                  </label>
                </div>
                
                {isIncluded && debtIndex >= 0 && (
                  <div className="ml-6 grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Interest Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.debt_accounts[debtIndex].interest_rate}
                        onChange={(e) => handleDebtAccountChange(debtIndex, 'interest_rate', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Min Payment (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.debt_accounts[debtIndex].minimum_payment}
                        onChange={(e) => handleDebtAccountChange(debtIndex, 'minimum_payment', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Current Balance (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.debt_accounts[debtIndex].current_balance}
                        onChange={(e) => handleDebtAccountChange(debtIndex, 'current_balance', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {calculation.projected_payoff_months > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-800">Projected Results</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600">Debt-Free In:</p>
              <p className="text-lg font-bold text-blue-900">{calculation.projected_payoff_months} months</p>
            </div>
            <div>
              <p className="text-sm text-blue-600">Interest Saved:</p>
              <p className="text-lg font-bold text-blue-900">
                {formatCurrency(calculation.total_interest_saved, 'EUR')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-red-600 hover:bg-red-700">
          {plan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
}
