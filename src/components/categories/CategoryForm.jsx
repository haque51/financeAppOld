
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_TYPES = ["income", "expense", "transfer"];

const PREDEFINED_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#64748b"
];

export default function CategoryForm({ category, defaultType, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    type: defaultType || "expense",
    color: PREDEFINED_COLORS[0],
    budget_amount: "",
    parent_id: "",
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        type: category.type || defaultType || "expense",
        color: category.color || PREDEFINED_COLORS[0],
        budget_amount: category.budget_amount || "",
        parent_id: category.parent_id || "",
        is_active: category.is_active !== undefined ? category.is_active : true
      });
    } else {
      setFormData({
        name: "",
        type: defaultType || "expense",
        color: PREDEFINED_COLORS[0],
        budget_amount: "",
        parent_id: "",
        is_active: true
      });
    }
  }, [category, defaultType]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const dataToSubmit = {
      ...formData,
      budget_amount: formData.budget_amount ? Number(formData.budget_amount) : null
    };

    // Remove empty parent_id
    if (!dataToSubmit.parent_id) {
      delete dataToSubmit.parent_id;
    }

    await onSubmit(dataToSubmit);
    setIsSubmitting(false);
  };

  const isSubcategory = !!formData.parent_id;
  const isEditing = !!(category && category.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          {isSubcategory ? 'Subcategory Name' : 'Category Name'}
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder={`e.g., ${isSubcategory ? 'Online Shopping' : 'Groceries'}`}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleChange("type", value)}
          disabled={isSubcategory}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                formData.color === color 
                  ? 'border-slate-900 scale-110' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleChange("color", color)}
            />
          ))}
        </div>
        <Input
          id="color"
          type="color"
          value={formData.color}
          onChange={(e) => handleChange("color", e.target.value)}
          className="w-20 h-10"
        />
      </div>

      {formData.type === 'expense' && !isSubcategory && (
        <div className="space-y-2">
          <Label htmlFor="budget_amount">Monthly Budget (Optional)</Label>
          <Input
            id="budget_amount"
            type="number"
            step="0.01"
            value={formData.budget_amount}
            onChange={(e) => handleChange("budget_amount", e.target.value)}
            placeholder="0.00"
          />
          <p className="text-xs text-slate-500">
            Set a monthly spending limit for this category in EUR
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? (isEditing ? "Saving..." : "Generating Icon...") : (isEditing ? "Update Category" : "Create Category")}
        </Button>
      </div>
    </form>
  );
}
