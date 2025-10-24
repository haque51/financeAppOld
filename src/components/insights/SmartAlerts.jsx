
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, AlertTriangle, CheckCircle, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SmartAlertForm from "./SmartAlertForm";
import { SpendingAlert } from "@/api/entities";

export default function SmartAlerts({ alerts, transactions, categories, accounts, currentUser, isLoading, onDataChange }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);

  const handleAddNew = () => {
    setEditingAlert(null);
    setIsFormOpen(true);
  };

  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setIsFormOpen(true);
  };

  const handleToggleActive = async (alertId, isActive) => {
    try {
      await SpendingAlert.update(alertId, { is_active: isActive });
      onDataChange();
    } catch (error) {
      console.error("Failed to toggle alert:", error);
    }
  };

  const handleDelete = async (alertId) => {
    if (window.confirm("Are you sure you want to delete this alert?")) {
      try {
        await SpendingAlert.delete(alertId);
        onDataChange();
      } catch (error) {
        console.error("Failed to delete alert:", error);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      const dataToSave = {
        ...formData,
        created_by: currentUser.email,
      };

      // Sanitize numeric fields before saving
      dataToSave.threshold_amount = formData.threshold_amount ? Number(formData.threshold_amount) : null;
      dataToSave.threshold_percentage = formData.threshold_percentage ? Number(formData.threshold_percentage) : null;
      
      // Remove null values so they are not sent in the payload
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === null) {
          delete dataToSave[key];
        }
      });

      if (editingAlert) {
        await SpendingAlert.update(editingAlert.id, dataToSave);
      } else {
        await SpendingAlert.create(dataToSave);
      }

      setIsFormOpen(false);
      setEditingAlert(null);
      onDataChange();
    } catch (error) {
      console.error("Error saving alert:", error);
      alert("Failed to save alert.");
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Smart Alerts</h2>
          <p className="text-slate-600 mt-1">Get notified about important spending patterns.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAlert ? "Edit Alert" : "Create Smart Alert"}
              </DialogTitle>
            </DialogHeader>
            <SmartAlertForm
              alert={editingAlert}
              categories={categories}
              accounts={accounts}
              onSubmit={handleSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {alerts.length === 0 ? (
        <Card className="text-center py-12 border-2 border-dashed border-slate-300 glass-effect">
          <CardContent className="pt-6">
            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">No Alerts Set Up</h3>
            <p className="text-slate-500 mt-2">Create your first alert to stay on top of your spending.</p>
            <Button onClick={handleAddNew} className="mt-4 bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => {
            const category = categories.find(c => c.id === alert.category_id);
            const account = accounts.find(a => a.id === alert.account_id);
            
            return (
              <Card key={alert.id} className="shadow-sm border-slate-200 glass-effect">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {alert.is_active ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-gray-400" />
                        )}
                        <h3 className="font-medium text-slate-800">{alert.name}</h3>
                        <Badge variant={alert.is_active ? "default" : "secondary"}>
                          {alert.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-slate-600 space-y-1">
                        <p><strong>Type:</strong> {alert.alert_type.replace('_', ' ')}</p>
                        {category && <p><strong>Category:</strong> {category.name}</p>}
                        {account && <p><strong>Account:</strong> {account.name}</p>}
                        {alert.threshold_amount && <p><strong>Amount:</strong> €{alert.threshold_amount}</p>}
                        {alert.threshold_percentage && <p><strong>Threshold:</strong> {alert.threshold_percentage}%</p>}
                        {alert.last_triggered && (
                          <p><strong>Last Triggered:</strong> {new Date(alert.last_triggered).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={(checked) => handleToggleActive(alert.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(alert)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(alert.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
