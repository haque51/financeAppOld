
import React, { useState, useEffect, useCallback } from "react";
import { Account, Transaction, User } from "@/api/entities"; // Added User import
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import AccountCard from "../components/accounts/AccountCard";
import AccountForm from "../components/accounts/AccountForm";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // New state for current user
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [exchangeRates, setExchangeRates] = useState({ USD: 0.92, BDT: 0.0084, EUR: 1 });

  const fetchExchangeRates = useCallback(async () => {
    try {
      const result = await InvokeLLM({
        prompt: "Get current exchange rates for USD to EUR and BDT to EUR.",
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            USD_to_EUR: { type: "number" },
            BDT_to_EUR: { type: "number" },
          },
        },
      });
      if (result.USD_to_EUR && result.BDT_to_EUR) {
        setExchangeRates({
          USD: result.USD_to_EUR,
          BDT: result.BDT_to_EUR,
          EUR: 1,
        });
      }
    } catch (error) {
      console.warn("Could not fetch live rates, using defaults.");
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get current user first
      const user = await User.me();
      setCurrentUser(user);

      // Filter accounts by current user
      const accountsData = await Account.filter({ created_by: user.email }, "-created_date");
      setAccounts(accountsData);
    } catch (error) {
      console.error("Error loading accounts:", error);
      // Handle cases where user might not be logged in or other errors
      setCurrentUser(null); 
      setAccounts([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchExchangeRates();
    loadAccounts();
  }, [fetchExchangeRates, loadAccounts]);

  const handleAddNew = () => {
    setEditingAccount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (accountId) => {
    if (!currentUser) {
      alert("Error: Current user not identified. Cannot delete account.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this account and all its transactions? This action cannot be undone.")) {
      try {
        // This is a cascading delete, be careful.
        // First, find all transactions for this account and delete them.
        // Only delete transactions created by current user for this account
        const transactionsToDelete = await Transaction.filter({ 
          account_id: accountId,
          created_by: currentUser.email 
        });
        for (const trans of transactionsToDelete) {
          await Transaction.delete(trans.id);
        }
        
        await Account.delete(accountId);
        loadAccounts();
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account.");
      }
    }
  };

  const handleSave = async (formData) => {
    if (!currentUser) {
      alert("Error: Current user not identified. Cannot save account.");
      return;
    }

    try {
      const rate = exchangeRates[formData.currency] || 1;
      let dataToSave = { 
        ...formData,
        created_by: currentUser.email
      };
  
      if (editingAccount) {
        // For editing, use the current_balance from the form
        dataToSave.balance = formData.current_balance;
        dataToSave.balance_eur = formData.current_balance * rate;
        // Don't update opening_balance when editing, it's an initial value
        delete dataToSave.opening_balance;
        // Remove current_balance as it's a form-specific field, not a database field
        delete dataToSave.current_balance; 
        
        await Account.update(editingAccount.id, dataToSave);
      } else {
        // For new accounts, set both opening and current balance
        const initialBalance = formData.current_balance || formData.opening_balance;
        dataToSave.balance = initialBalance;
        dataToSave.balance_eur = initialBalance * rate;
        // Remove current_balance as it's a form-specific field, not a database field
        delete dataToSave.current_balance; 
        
        await Account.create(dataToSave);
      }
  
      setIsFormOpen(false);
      setEditingAccount(null);
      loadAccounts();
    } catch (error) {
      console.error("Error saving account:", error);
      alert("Failed to save account.");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Accounts</h1>
          <p className="text-slate-600 mt-1">
            View, add, and edit your financial accounts.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Edit Account" : "Add New Account"}
              </DialogTitle>
            </DialogHeader>
            <AccountForm
              account={editingAccount}
              onSubmit={handleSave}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <AccountCard.Skeleton key={i} />)
          : accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={() => handleEdit(account)}
                onDelete={() => handleDelete(account.id)}
              />
            ))}
      </div>
      
      {!isLoading && accounts.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl">
            <h3 className="text-xl font-semibold text-slate-800">No Accounts Found</h3>
            <p className="text-slate-500 mt-2">Get started by adding your first financial account.</p>
            <Button onClick={handleAddNew} className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
        </div>
      )}
    </div>
  );
}
