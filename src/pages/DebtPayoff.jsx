import React, { useState, useEffect, useCallback } from "react";
import { User, Account, DebtPayoffPlan } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Plus, Calculator } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import DebtPayoffPlanCard from "../components/debt/DebtPayoffPlanCard";
import DebtPayoffPlanForm from "../components/debt/DebtPayoffPlanForm";
import DebtOverview from "../components/debt/DebtOverview";

export default function DebtPayoffPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [debtAccounts, setDebtAccounts] = useState([]);
  const [payoffPlans, setPayoffPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [accountsData, plansData] = await Promise.all([
        Account.filter({ 
          created_by: user.email, 
          is_active: true,
          type: ['loan', 'credit_card'] 
        }),
        DebtPayoffPlan.filter({ created_by: user.email })
      ]);

      // Filter for debt accounts with balances > 0
      const activeDebtAccounts = accountsData.filter(acc => (acc.balance || 0) > 0);
      setDebtAccounts(activeDebtAccounts);
      setPayoffPlans(plansData);
    } catch (error) {
      console.error("Error loading debt data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddNew = () => {
    setEditingPlan(null);
    setIsFormOpen(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleDelete = async (planId) => {
    if (window.confirm("Are you sure you want to delete this debt payoff plan?")) {
      try {
        await DebtPayoffPlan.delete(planId);
        loadData();
      } catch (error) {
        console.error("Error deleting debt payoff plan:", error);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      const dataToSave = {
        ...formData,
        created_by: currentUser.email,
      };

      if (editingPlan) {
        await DebtPayoffPlan.update(editingPlan.id, dataToSave);
      } else {
        await DebtPayoffPlan.create(dataToSave);
      }

      setIsFormOpen(false);
      setEditingPlan(null);
      loadData();
    } catch (error) {
      console.error("Error saving debt payoff plan:", error);
      alert("Failed to save debt payoff plan.");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <TrendingDown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Debt Payoff Planner</h1>
            <p className="text-slate-600 mt-1">Strategically eliminate your debt and save on interest.</p>
          </div>
        </div>
        
        {debtAccounts.length > 0 && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Payoff Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPlan ? "Edit Payoff Plan" : "Create Debt Payoff Plan"}
                </DialogTitle>
              </DialogHeader>
              <DebtPayoffPlanForm
                plan={editingPlan}
                debtAccounts={debtAccounts}
                onSubmit={handleSave}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DebtOverview 
        debtAccounts={debtAccounts} 
        isLoading={isLoading}
      />

      {debtAccounts.length === 0 && !isLoading && (
        <Card className="text-center py-16 border-2 border-dashed border-slate-300 bg-white/60">
          <CardContent className="pt-6">
            <Calculator className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800">No Active Debt</h3>
            <p className="text-slate-500 mt-2">Congratulations! You don't have any active debt accounts.</p>
          </CardContent>
        </Card>
      )}

      {debtAccounts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Your Payoff Plans</h2>
          
          {payoffPlans.length === 0 ? (
            <Card className="text-center py-12 border-2 border-dashed border-slate-300 bg-white/60">
              <CardContent className="pt-6">
                <Calculator className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800">Create Your First Payoff Plan</h3>
                <p className="text-slate-500 mt-2">Design a strategy to eliminate your debt efficiently.</p>
                <Button onClick={handleAddNew} className="mt-4 bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {payoffPlans.map((plan) => (
                <DebtPayoffPlanCard
                  key={plan.id}
                  plan={plan}
                  debtAccounts={debtAccounts}
                  onEdit={() => handleEdit(plan)}
                  onDelete={() => handleDelete(plan.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}