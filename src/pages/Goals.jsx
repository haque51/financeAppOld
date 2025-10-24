import React, { useState, useEffect, useCallback } from "react";
import { FinancialGoal, Account, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import GoalCard from "../components/goals/GoalCard";
import GoalForm from "../components/goals/GoalForm";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const [goalsData, accountsData] = await Promise.all([
        FinancialGoal.filter({ created_by: user.email }, "-target_date"),
        Account.filter({ created_by: user.email }),
      ]);

      // Automatically update current_amount for linked accounts
      const updatedGoalsData = goalsData.map(goal => {
        if (goal.linked_account_id) {
          const linkedAccount = accountsData.find(acc => acc.id === goal.linked_account_id);
          if (linkedAccount) {
            return { ...goal, current_amount: linkedAccount.balance };
          }
        }
        return goal;
      });

      setGoals(updatedGoalsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error("Error loading goals data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddNew = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (goalId) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await FinancialGoal.delete(goalId);
        loadData();
      } catch (error) {
        console.error("Error deleting goal:", error);
        alert("Failed to delete goal.");
      }
    }
  };

  const handleSave = async (formData) => {
    if (!currentUser) return;
    try {
      if (editingGoal) {
        await FinancialGoal.update(editingGoal.id, formData);
      } else {
        await FinancialGoal.create({ ...formData, created_by: currentUser.email });
      }
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      console.error("Error saving goal:", error);
      alert("Failed to save goal.");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Financial Goals</h1>
            <p className="text-slate-600 mt-1">Set, track, and achieve your financial ambitions.</p>
          </div>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{editingGoal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
            </DialogHeader>
            <GoalForm
              goal={editingGoal}
              accounts={accounts}
              onSubmit={handleSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <GoalCard.Skeleton key={i} />)}
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              accounts={accounts}
              onEdit={() => handleEdit(goal)}
              onDelete={() => handleDelete(goal.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl">
          <Target className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800">No Goals Yet</h3>
          <p className="text-slate-500 mt-2">Create your first goal to start saving for your future.</p>
          <Button onClick={handleAddNew} className="mt-4 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>
      )}
    </div>
  );
}