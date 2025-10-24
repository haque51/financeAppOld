import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AutoCategorizationRuleForm({ rule, categories, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    condition_field: "payee",
    condition_operator: "contains",
    condition_value: "",
    target_category_id: "",
    is_active: true,
  });

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    }
  }, [rule]);

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
        <Label htmlFor="name">Rule Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="e.g., Netflix Subscription Rule"
          required
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2 col-span-1">
              <Label>If</Label>
              <Select value={formData.condition_field} onValueChange={v => handleChange('condition_field', v)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="payee">Payee</SelectItem>
                      <SelectItem value="memo">Memo</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          <div className="space-y-2 col-span-1">
              <Label>Is</Label>
              <Select value={formData.condition_operator} onValueChange={v => handleChange('condition_operator', v)}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="starts_with">Starts With</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          <div className="space-y-2 col-span-1">
              <Label>Value</Label>
              <Input value={formData.condition_value} onChange={e => handleChange('condition_value', e.target.value)} required/>
          </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_category_id">Then Categorize As</Label>
        <Select
          value={formData.target_category_id}
          onValueChange={(value) => handleChange("target_category_id", value)}
          required
        >
          <SelectTrigger id="target_category_id">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Rule</Button>
      </div>
    </form>
  );
}