import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { TransactionTemplate } from '@/api/entities';
import TransactionTemplateForm from './TransactionTemplateForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function TransactionTemplateList({ transactionTemplates, accounts, categories, currentUser, isLoading, onDataChange }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const handleAddNew = () => {
        setEditingTemplate(null);
        setIsFormOpen(true);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            await TransactionTemplate.delete(id);
            onDataChange();
        }
    };

    const handleSave = async (formData) => {
        if (editingTemplate) {
            await TransactionTemplate.update(editingTemplate.id, formData);
        } else {
            await TransactionTemplate.create({ ...formData, created_by: currentUser.email });
        }
        setIsFormOpen(false);
        onDataChange();
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Transaction Templates</CardTitle>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleAddNew}>
                            <Plus className="w-4 h-4 mr-2" /> Add Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingTemplate ? 'Edit' : 'Add'} Transaction Template</DialogTitle>
                        </DialogHeader>
                        <TransactionTemplateForm
                            template={editingTemplate}
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
                    {transactionTemplates.map(template => (
                        <div key={template.id} className="p-4 border rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold">{template.template_name}</p>
                                <p className="text-sm text-slate-600">{template.payee || 'No payee'}</p>
                            </div>
                            <div>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                            </div>
                        </div>
                    ))}
                     {!isLoading && transactionTemplates.length === 0 && <p className="text-center text-slate-500 py-8">No templates yet. Create one to speed up data entry!</p>}
                </div>
            </CardContent>
        </Card>
    );
}