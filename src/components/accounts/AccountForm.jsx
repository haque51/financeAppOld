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
import { Textarea } from "@/components/ui/textarea";

const ACCOUNT_TYPES = ["checking", "savings", "credit_card", "loan", "brokerage", "investment", "cash"];
const CURRENCIES = ["EUR", "USD", "BDT"];

export default function AccountForm({ account, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "checking",
    currency: "EUR",
    opening_balance: 0,
    current_balance: 0,
    institution: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || "",
        type: account.type || "checking",
        currency: account.currency || "EUR",
        opening_balance: account.opening_balance || 0,
        current_balance: account.balance || 0,
        institution: account.institution || "",
        notes: account.notes || "",
      });
    } else {
      setFormData({
        name: "",
        type: "checking",
        currency: "EUR",
        opening_balance: 0,
        current_balance: 0,
        institution: "",
        notes: "",
      });
    }
  }, [account]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const dataToSubmit = {
      ...formData,
      opening_balance: Number(formData.opening_balance) || 0,
      current_balance: Number(formData.current_balance) || 0,
    }
    await onSubmit(dataToSubmit);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="e.g., Main Checking Account"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Account Type</Label>
          <Select
            id="type"
            value={formData.type}
            onValueChange={(value) => handleChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            id="currency"
            value={formData.currency}
            onValueChange={(value) => handleChange("currency", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="opening_balance">Opening Balance</Label>
          <Input
            id="opening_balance"
            type="number"
            step="0.01"
            value={formData.opening_balance}
            onChange={(e) => handleChange("opening_balance", e.target.value)}
            placeholder="0.00"
            disabled={!!account}
          />
          {!!account && <p className="text-xs text-slate-500">Opening balance cannot be changed after account creation.</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="current_balance">Current Balance</Label>
          <Input
            id="current_balance"
            type="number"
            step="0.01"
            value={formData.current_balance}
            onChange={(e) => handleChange("current_balance", e.target.value)}
            placeholder="0.00"
          />
          <p className="text-xs text-slate-500">
            {account ? "Adjust for manual reconciliation." : "Will be set to opening balance initially."}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="institution">Financial Institution</Label>
        <Input
          id="institution"
          value={formData.institution}
          onChange={(e) => handleChange("institution", e.target.value)}
          placeholder="e.g., Deutsche Bank"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Optional notes about the account"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? "Saving..." : "Save Account"}
        </Button>
      </div>
    </form>
  );
}