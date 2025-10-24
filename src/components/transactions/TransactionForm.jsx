
import React, { useState, useEffect, useRef } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { FileText, Paperclip, X, Eye, CalendarIcon } from "lucide-react";
import { UploadPrivateFile, CreateFileSignedUrl } from "@/api/integrations"; // Import integrations

const TRANSACTION_TYPES = ["income", "expense", "transfer"];

export default function TransactionForm({ 
  transaction, 
  accounts, 
  categories, 
  templates, // Added templates prop
  exchangeRates,
  onSubmit, 
  onCancel 
}) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    account_id: "",
    type: "expense",
    payee: "",
    category_id: "",
    subcategory_id: "",
    amount: '', // Changed from 0 to '' for better input handling
    currency: "EUR",
    memo: "",
    to_account_id: "",
    receipt_url: "" // Add receipt_url to initial state
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (transaction) {
      setFormData({
        ...transaction,
        date: format(new Date(transaction.date || new Date()), 'yyyy-MM-dd'),
        amount: transaction.amount ? transaction.amount.toString() : '', // Ensure amount is string for input
        receipt_url: transaction.receipt_url || '' // Load existing receipt url
      });
    }
  }, [transaction]);

  useEffect(() => {
    // Convert formData.amount to a number for calculation, defaulting to 0 if empty or invalid
    const amountNum = Number(formData.amount) || 0; 
    const rate = exchangeRates[formData.currency] || 1;
    setConvertedAmount(amountNum * rate);
  }, [formData.amount, formData.currency, exchangeRates]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // New function to handle loading from a template
  const handleTemplateLoad = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
        setFormData(prev => ({
            ...prev,
            ...template,
            date: prev.date, // keep the current date
            amount: template.amount ? template.amount.toString() : '', // ensure amount is string and defaults to ''
            receipt_url: template.receipt_url || '' // Load receipt_url from template if available
        }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_uri } = await UploadPrivateFile({ file });
      handleChange("receipt_url", file_uri);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload receipt.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveReceipt = () => {
    handleChange("receipt_url", "");
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleViewReceipt = async () => {
    if (!formData.receipt_url) return;
    try {
        const { signed_url } = await CreateFileSignedUrl({ file_uri: formData.receipt_url });
        window.open(signed_url, '_blank');
    } catch (error) {
        console.error("Error generating signed URL:", error);
        alert("Could not open receipt.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const dataToSubmit = {
      ...formData,
      amount: Number(formData.amount) || 0 // Convert amount to number for submission
    };
    
    await onSubmit(dataToSubmit);
    setIsSubmitting(false);
  };

  // Renamed from availableCategories to parentCategories for clarity as per outline's usage
  const parentCategories = categories.filter(c => 
    !c.parent_id && (c.type === formData.type || formData.type === 'transfer')
  );
  // This definition is correct for subcategories based on the selected parent category
  const availableSubcategories = categories.filter(c => 
    c.parent_id === formData.category_id
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* New "Load from Template" section */}
      {templates && templates.length > 0 && (
          <div className="space-y-2">
              <Label>Load from Template</Label>
              <div className="flex gap-2">
                  <Select onValueChange={handleTemplateLoad}>
                      <SelectTrigger>
                          <SelectValue placeholder="Select a template..." />
                      </SelectTrigger>
                      <SelectContent>
                          {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.template_name}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
          </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(new Date(formData.date), 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.date ? new Date(formData.date) : undefined}
                onSelect={(date) => handleChange("date", date ? format(date, 'yyyy-MM-dd') : '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleChange("type", value)}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="account">{formData.type === 'transfer' ? "From Account" : "Account"}</Label>
        <Select
          value={formData.account_id}
          onValueChange={(value) => {
            handleChange("account_id", value);
            const account = accounts.find(a => a.id === value);
            if (account) {
              handleChange("currency", account.currency);
            }
          }}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} ({account.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'transfer' && (
        <div className="space-y-2">
          <Label htmlFor="to_account">To Account</Label>
          <Select
            value={formData.to_account_id}
            onValueChange={(value) => handleChange("to_account_id", value)}
            required={formData.type === 'transfer'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select destination account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.filter(a => a.id !== formData.account_id).map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} ({account.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        {/* Updated label for payee/description */}
        <Label htmlFor="payee">{formData.type === 'transfer' ? "Description" : "Payee/Description"}</Label>
        <Input
          id="payee"
          value={formData.payee}
          onChange={(e) => handleChange("payee", e.target.value)}
          placeholder={
            formData.type === 'transfer' 
              ? "e.g., Monthly savings transfer"
              : "Who did you pay or receive from?"
          }
        />
      </div>

      {formData.type !== 'transfer' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            {/* Updated onValueChange to reset subcategory when category changes */}
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value, subcategory_id: '' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {/* Using parentCategories here */}
                {parentCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Conditionally render subcategory select and disable if no subcategories are available */}
          <div className="space-y-2">
            <Label htmlFor="subcategory">Subcategory</Label>
            <Select
              value={formData.subcategory_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory_id: value }))}
              disabled={availableSubcategories.length === 0} // Disabled when no subcategories
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {availableSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount} // Value is a string to allow empty input
            onChange={(e) => handleChange("amount", e.target.value)} // Store as string
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleChange("currency", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="BDT">BDT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Only show converted amount if base currency is not EUR and amount is a valid number greater than 0 */}
      {formData.currency !== 'EUR' && (Number(formData.amount) || 0) > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Converted to EUR:</strong> €{convertedAmount.toFixed(2)}
            <span className="text-blue-500 ml-2">
              (Rate: 1 {formData.currency} = {exchangeRates[formData.currency]?.toFixed(4)} EUR)
            </span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="memo">Memo</Label>
        <Textarea
          id="memo"
          value={formData.memo}
          onChange={(e) => handleChange("memo", e.target.value)}
          placeholder="Optional notes about this transaction"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="receipt">Receipt</Label>
        {formData.receipt_url ? (
            <div className="flex items-center gap-2 p-2 rounded-md bg-slate-100 border">
                <Paperclip className="w-4 h-4 text-slate-600" />
                <span className="flex-1 text-sm text-slate-700 truncate">Receipt attached</span>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleViewReceipt}>
                    <Eye className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleRemoveReceipt}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
        ) : (
            <div className="relative">
                <Input
                    id="receipt"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="pr-24"
                />
                {isUploading && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500">Uploading...</span>
                )}
            </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isUploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading} className="bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? "Saving..." : "Save Transaction"}
        </Button>
      </div>
    </form>
  );
}
