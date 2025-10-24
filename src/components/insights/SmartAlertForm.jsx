import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SmartAlertForm({ alert, categories, accounts, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    alert_type: "",
    category_id: "",
    account_id: "",
    threshold_amount: "",
    threshold_percentage: "",
    is_active: true,
  });

  useEffect(() => {
    if (alert) {
      setFormData({
        name: alert.name || "",
        alert_type: alert.alert_type || "",
        category_id: alert.category_id || "",
        account_id: alert.account_id || "",
        threshold_amount: alert.threshold_amount || "",
        threshold_percentage: alert.threshold_percentage || "",
        is_active: alert.is_active,
      });
    }
  }, [alert]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Alert Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="e.g., High Grocery Spending"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alert_type">Alert Type</Label>
        <Select
          value={formData.alert_type}
          onValueChange={(value) => handleChange("alert_type", value)}
          required
        >
          <SelectTrigger id="alert_type">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="category_budget">Spending in Category</SelectItem>
            <SelectItem value="monthly_spending">Total Monthly Spending</SelectItem>
            <SelectItem value="account_balance">Account Balance Drops Below</SelectItem>
            <SelectItem value="unusual_transaction">Single Large Transaction</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.alert_type === "category_budget" && (
        <div className="space-y-2">
          <Label htmlFor="category_id">Category</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => handleChange("category_id", value)}
            required
          >
            <SelectTrigger id="category_id">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.filter(c => c.type === 'expense').map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {formData.alert_type === "account_balance" && (
        <div className="space-y-2">
          <Label htmlFor="account_id">Account</Label>
          <Select
            value={formData.account_id}
            onValueChange={(value) => handleChange("account_id", value)}
            required
          >
            <SelectTrigger id="account_id">
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(formData.alert_type === "category_budget" || formData.alert_type === "monthly_spending" || formData.alert_type === "account_balance" || formData.alert_type === "unusual_transaction") && (
        <div className="space-y-2">
          <Label htmlFor="threshold_amount">Threshold Amount (€)</Label>
          <Input
            id="threshold_amount"
            type="number"
            value={formData.threshold_amount}
            onChange={(e) => handleChange("threshold_amount", e.target.value)}
            placeholder="e.g., 500"
            required
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Alert</Button>
      </div>
    </form>
  );
}