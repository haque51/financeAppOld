
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';

export default function RecurrentTransactionForm({ transaction, accounts, categories, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        account_id: '',
        type: 'expense',
        payee: '',
        category_id: '',
        subcategory_id: '',
        amount: '', // Changed from 0 to empty string
        currency: 'EUR',
        memo: '',
        frequency: 'monthly',
        interval: 1,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
        to_account_id: ''
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                ...transaction,
                amount: transaction.amount ? transaction.amount.toString() : '', // Convert to string, empty if 0
                interval: Number(transaction.interval), // Ensure interval is number
                start_date: format(new Date(transaction.start_date), 'yyyy-MM-dd'),
                end_date: transaction.end_date ? format(new Date(transaction.end_date), 'yyyy-MM-dd') : '', // Ensure end_date is formatted or empty string
            });
        }
    }, [transaction]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = { 
            ...formData,
            amount: formData.amount === '' ? 0 : Number(formData.amount) // Ensure amount is a number for submission
        };
        
        // Calculate next_due_date based on start_date
        const startDate = new Date(formData.start_date);
        dataToSubmit.next_due_date = format(startDate, 'yyyy-MM-dd');
        
        onSubmit(dataToSubmit);
    };

    const parentCategories = categories.filter(cat => !cat.parent_id && cat.type === formData.type);
    const availableSubcategories = categories.filter(cat => cat.parent_id === formData.category_id);

    const frequencyUnit = {
        daily: 'day',
        weekly: 'week',
        monthly: 'month',
        yearly: 'year'
    }[formData.frequency];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Netflix Subscription"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>Payee</Label>
                    <Input
                        value={formData.payee || ''}
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
                        onChange={e => handleChange('amount', e.target.value)} 
                        required 
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={v => handleChange('currency', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Label htmlFor="type">Type *</Label>
                    <Select 
                        value={formData.type} 
                        onValueChange={v => handleChange('type', v)} 
                        required
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="account_id">{formData.type === 'transfer' ? 'From Account *' : 'Account *'}</Label>
                    <Select value={formData.account_id} onValueChange={v => handleChange('account_id', v)} required>
                        <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                        <SelectContent>
                            {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {formData.type === 'transfer' && (
                <div className="space-y-2">
                    <Label htmlFor="to_account_id">To Account *</Label>
                    <Select 
                        value={formData.to_account_id} 
                        onValueChange={v => handleChange('to_account_id', v)} 
                        required
                    >
                        <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                        <SelectContent>
                            {accounts.filter(a => a.id !== formData.account_id).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            )}

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

            <div className="space-y-2">
                <Label htmlFor="memo">Memo</Label>
                <Input 
                    id="memo" 
                    value={formData.memo || ''} 
                    onChange={e => handleChange('memo', e.target.value)} 
                    placeholder="Add a note or description" 
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Select value={formData.frequency} onValueChange={v => handleChange('frequency', v)} required>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="interval">Every *</Label>
                    <Input 
                        id="interval" 
                        type="number" 
                        value={formData.interval} 
                        onChange={e => handleChange('interval', Number(e.target.value))} 
                        required 
                        min="1" 
                    />
                </div>
                <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <p className="pt-2 text-slate-700">
                        {`${frequencyUnit}${formData.interval > 1 ? 's' : ''}`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input 
                        id="start_date" 
                        type="date" 
                        value={formData.start_date} 
                        onChange={e => handleChange('start_date', e.target.value)} 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end_date">End Date (Optional)</Label>
                    <Input 
                        id="end_date" 
                        type="date" 
                        value={formData.end_date || ''} 
                        onChange={e => handleChange('end_date', e.target.value)} 
                    />
                </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save</Button>
            </div>
        </form>
    );
}
