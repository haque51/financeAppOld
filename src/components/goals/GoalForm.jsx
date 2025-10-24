import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export default function GoalForm({ goal, accounts, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    linked_account_id: '',
    notes: ''
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || '',
        target_amount: goal.target_amount || '',
        current_amount: goal.current_amount || '',
        target_date: goal.target_date ? format(new Date(goal.target_date), 'yyyy-MM-dd') : '',
        linked_account_id: goal.linked_account_id || '',
        notes: goal.notes || ''
      });
    }
  }, [goal]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      target_amount: Number(formData.target_amount),
      current_amount: Number(formData.current_amount),
    };
    onSubmit(dataToSubmit);
  };

  const isLinkedAccount = !!formData.linked_account_id;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g., Vacation to Japan" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="target_amount">Target Amount (€)</Label>
          <Input id="target_amount" type="number" step="0.01" value={formData.target_amount} onChange={(e) => handleChange('target_amount', e.target.value)} placeholder="5000" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="current_amount">Current Amount (€)</Label>
          <Input id="current_amount" type="number" step="0.01" value={formData.current_amount} onChange={(e) => handleChange('current_amount', e.target.value)} placeholder="1000" required disabled={isLinkedAccount} />
           {isLinkedAccount && <p className="text-xs text-slate-500 mt-1">Managed by linked account balance.</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_date">Target Date</Label>
        <Input id="target_date" type="date" value={formData.target_date} onChange={(e) => handleChange('target_date', e.target.value)} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="linked_account_id">Link to a Savings Account (Optional)</Label>
        <Select value={formData.linked_account_id} onValueChange={(value) => handleChange('linked_account_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>None</SelectItem>
            {accounts.filter(a => a.type === 'savings').map(account => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500 mt-1">Linking an account will automatically track its balance as your saved amount.</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Any extra details about this goal..." />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Goal</Button>
      </div>
    </form>
  );
}
