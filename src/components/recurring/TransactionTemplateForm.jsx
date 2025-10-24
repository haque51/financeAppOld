
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TransactionTemplateForm({ template, accounts, categories, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        template_name: '',
        account_id: '',
        type: 'expense',
        payee: '',
        category_id: '',
        subcategory_id: '',
        amount: 0,
        currency: 'EUR', // Added new field
        memo: '', // Added new field
        to_account_id: '' // Added new field
    });

    useEffect(() => {
        if (template) {
            // Ensure amount is a number if it comes as string from template
            setFormData({
                ...template,
                amount: Number(template.amount) || 0,
                // Ensure currency, memo, to_account_id have defaults if not in template
                currency: template.currency || 'EUR',
                memo: template.memo || '',
                to_account_id: template.to_account_id || ''
            });
        }
    }, [template]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const dataToSubmit = {
            ...formData,
            amount: Number(formData.amount), // Ensure amount is always a number
        };

        if (dataToSubmit.type === 'transfer') {
            // Basic validation for transfer type
            if (!dataToSubmit.to_account_id) {
                alert('Please select a "To Account" for transfers.');
                return;
            }
            if (dataToSubmit.account_id === dataToSubmit.to_account_id) {
                alert('Cannot transfer to the same account.');
                return;
            }
            // For transfers, category and subcategory are typically not applicable, clear them.
            dataToSubmit.category_id = '';
            dataToSubmit.subcategory_id = '';
        } else {
            // For expense/income, to_account_id is not applicable, clear it.
            dataToSubmit.to_account_id = '';
        }
        
        onSubmit(dataToSubmit);
    };

    const parentCategories = categories.filter(cat => !cat.parent_id && cat.type === formData.type);
    const availableSubcategories = categories.filter(cat => cat.parent_id === formData.category_id);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Template Name *</Label>
                    <Input
                        value={formData.template_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
                        placeholder="e.g., Weekly Groceries"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Payee</Label>
                    <Input
                        value={formData.payee}
                        onChange={(e) => setFormData(prev => ({ ...prev, payee: e.target.value }))}
                        placeholder="Enter payee name"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={v => setFormData(prev => ({ ...prev, currency: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            {/* Add more currencies as needed */}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="account_id">Account (From) *</Label>
                    <Select value={formData.account_id || ''} onValueChange={v => setFormData(prev => ({ ...prev, account_id: v }))} required>
                        <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                        <SelectContent>
                            {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={v => setFormData(prev => ({ ...prev, type: v, category_id: '', subcategory_id: '', to_account_id: '' }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {formData.type === 'transfer' ? (
                <div className="space-y-2">
                    <Label htmlFor="to_account_id">Account (To) *</Label>
                    <Select value={formData.to_account_id || ''} onValueChange={v => setFormData(prev => ({ ...prev, to_account_id: v }))} required>
                        <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                        <SelectContent>
                            {accounts.filter(a => a.id !== formData.account_id).map(a => (
                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.category_id || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value, subcategory_id: '' }))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {parentCategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Subcategory</Label>
                        <Select 
                            value={formData.subcategory_id || ''} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory_id: value }))}
                            disabled={availableSubcategories.length === 0}
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

            <div className="space-y-2">
                <Label htmlFor="memo">Memo</Label>
                <Input id="memo" value={formData.memo} onChange={e => setFormData(prev => ({ ...prev, memo: e.target.value }))} placeholder="Add a note" />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Template</Button>
            </div>
        </form>
    );
}
