import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { RecurrentTransaction } from '@/api/entities';
import RecurrentTransactionForm from './RecurrentTransactionForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function RecurrentTransactionList({ recurrentTransactions, accounts, categories, currentUser, isLoading, onDataChange }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const handleAddNew = () => {
        setEditingTransaction(null);
        setIsFormOpen(true);
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this recurrent transaction?')) {
            await RecurrentTransaction.delete(id);
            onDataChange();
        }
    };

    const handleSave = async (formData) => {
        if (editingTransaction) {
            await RecurrentTransaction.update(editingTransaction.id, formData);
        } else {
            await RecurrentTransaction.create({ ...formData, created_by: currentUser.email });
        }
        setIsFormOpen(false);
        onDataChange();
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Recurring Transactions</CardTitle>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddNew}>
                            <Plus className="w-4 h-4 mr-2" /> Add Recurring
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingTransaction ? 'Edit' : 'Add'} Recurring Transaction</DialogTitle>
                        </DialogHeader>
                        <RecurrentTransactionForm
                            transaction={editingTransaction}
                            accounts={accounts}
                            categories={categories}
                            onSubmit={handleSave}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recurrentTransactions.map(tx => {
                        const account = accounts.find(a => a.id === tx.account_id);
                        return (
                            <div key={tx.id} className="p-4 border rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{tx.name}</p>
                                    <p className="text-sm text-slate-600">
                                        €{tx.amount.toFixed(2)} from {account?.name || 'N/A'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Next on: {format(new Date(tx.next_due_date), 'PPP')}
                                    </p>
                                </div>
                                <div>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(tx)}><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(tx.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </div>
                            </div>
                        );
                    })}
                    {!isLoading && recurrentTransactions.length === 0 && <p className="text-center text-slate-500 py-8">No recurring transactions yet.</p>}
                </div>
            </CardContent>
        </Card>
    );
}