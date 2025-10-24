import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Target, CheckCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AutoCategorizationRuleForm from "./AutoCategorizationRuleForm";
import { CategorizationRule } from "@/api/entities";

export default function AutoCategorizationRules({ rules, categories, currentUser, isLoading, onDataChange }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const handleAddNew = () => {
    setEditingRule(null);
    setIsFormOpen(true);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setIsFormOpen(true);
  };

  const handleToggleActive = async (ruleId, isActive) => {
    try {
      await CategorizationRule.update(ruleId, { is_active: isActive });
      onDataChange();
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    }
  };

  const handleDelete = async (ruleId) => {
    if (window.confirm("Are you sure you want to delete this rule?")) {
      try {
        await CategorizationRule.delete(ruleId);
        onDataChange();
      } catch (error) {
        console.error("Failed to delete rule:", error);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      const dataToSave = { ...formData, created_by: currentUser.email };
      if (editingRule) {
        await CategorizationRule.update(editingRule.id, dataToSave);
      } else {
        await CategorizationRule.create(dataToSave);
      }
      setIsFormOpen(false);
      setEditingRule(null);
      onDataChange();
    } catch (error) {
      console.error("Error saving rule:", error);
      alert("Failed to save rule.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Automation Rules</h2>
          <p className="text-slate-600 mt-1">Automatically categorize transactions.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRule ? "Edit Rule" : "Create New Rule"}</DialogTitle>
            </DialogHeader>
            <AutoCategorizationRuleForm
              rule={editingRule}
              categories={categories}
              onSubmit={handleSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <Card className="text-center py-12 border-2 border-dashed border-slate-300 glass-effect">
          <CardContent className="pt-6">
            <Target className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">No Automation Rules</h3>
            <p className="text-slate-500 mt-2">Create your first rule to automate transaction categorization.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => {
            const targetCategory = categories.find(c => c.id === rule.target_category_id);
            return (
              <Card key={rule.id} className="shadow-sm border-slate-200 glass-effect">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-slate-800">{rule.name}</h3>
                      <p className="text-sm text-slate-600">
                        If <strong>{rule.condition_field}</strong> {rule.condition_operator.replace('_', ' ')} "<strong>{rule.condition_value}</strong>",
                        categorize as <strong>{targetCategory?.name || 'N/A'}</strong>.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.is_active} onCheckedChange={(checked) => handleToggleActive(rule.id, checked)} />
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(rule)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)} className="text-red-500 hover:text-red-700">Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}