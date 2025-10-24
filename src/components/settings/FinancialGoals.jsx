import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, TrendingUp, PiggyBank } from "lucide-react";

export default function FinancialGoals({ user, onUpdate, isSaving }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    monthly_income_target: user?.monthly_income_target || "",
    monthly_savings_target: user?.monthly_savings_target || ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSubmit = {
      monthly_income_target: formData.monthly_income_target ? Number(formData.monthly_income_target) : null,
      monthly_savings_target: formData.monthly_savings_target ? Number(formData.monthly_savings_target) : null
    };
    
    await onUpdate(dataToSubmit);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      monthly_income_target: user?.monthly_income_target || "",
      monthly_savings_target: user?.monthly_savings_target || ""
    });
    setIsEditing(false);
  };

  const savingsRate = user?.monthly_income_target && user?.monthly_savings_target 
    ? (user.monthly_savings_target / user.monthly_income_target) * 100 
    : 0;

  return (
    <div className="grid gap-6">
      <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-slate-600" />
            Financial Targets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-600">
            Set monthly financial goals to track your progress and stay motivated.
          </p>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income_target">Monthly Income Target</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">€</span>
                    <Input
                      id="income_target"
                      type="number"
                      step="0.01"
                      value={formData.monthly_income_target}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthly_income_target: e.target.value }))}
                      placeholder="5000.00"
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="savings_target">Monthly Savings Target</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">€</span>
                    <Input
                      id="savings_target"
                      type="number"
                      step="0.01"
                      value={formData.monthly_savings_target}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthly_savings_target: e.target.value }))}
                      placeholder="1000.00"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? "Saving..." : "Save Goals"}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium text-emerald-800">Income Target</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-900">
                    {user?.monthly_income_target 
                      ? `€${user.monthly_income_target.toLocaleString()}` 
                      : 'Not set'
                    }
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">per month</p>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <PiggyBank className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Savings Target</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {user?.monthly_savings_target 
                      ? `€${user.monthly_savings_target.toLocaleString()}` 
                      : 'Not set'
                    }
                  </p>
                  <p className="text-sm text-blue-600 mt-1">per month</p>
                </div>
              </div>

              {savingsRate > 0 && (
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-purple-800">Target Savings Rate</span>
                    <span className="text-xl font-bold text-purple-900">{savingsRate.toFixed(1)}%</span>
                  </div>
                  <p className="text-sm text-purple-600 mt-1">
                    {savingsRate >= 20 ? "Excellent savings rate!" : 
                     savingsRate >= 10 ? "Good savings target!" : 
                     "Consider increasing your savings rate"}
                  </p>
                </div>
              )}

              <Button variant="outline" onClick={() => setIsEditing(true)}>
                {user?.monthly_income_target || user?.monthly_savings_target ? 'Edit Goals' : 'Set Goals'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}