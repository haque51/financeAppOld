import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Transaction, Account, RecurrentTransaction, TransactionTemplate } from "@/api/entities";
import { 
  AlertTriangle, 
  RefreshCw,
  Trash2
} from "lucide-react";

export default function StartOver({ user, onComplete }) {
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleStartOver = async () => {
    if (confirmText !== "DELETE ALL DATA") {
      alert('Please type "DELETE ALL DATA" exactly to confirm.');
      return;
    }

    if (!window.confirm("This will permanently delete ALL your financial data including transactions, recurring transactions, and templates. Account structures will remain but balances will be reset to opening balances. This action CANNOT be undone. Are you absolutely sure?")) {
      return;
    }

    setIsResetting(true);
    try {
      // Delete all transactions
      const transactions = await Transaction.filter({ created_by: user.email });
      for (const transaction of transactions) {
        await Transaction.delete(transaction.id);
      }

      // Delete all recurring transactions
      const recurringTransactions = await RecurrentTransaction.filter({ created_by: user.email });
      for (const recurring of recurringTransactions) {
        await RecurrentTransaction.delete(recurring.id);
      }

      // Delete all transaction templates
      const templates = await TransactionTemplate.filter({ created_by: user.email });
      for (const template of templates) {
        await TransactionTemplate.delete(template.id);
      }

      // Reset all account balances to their opening balance
      const accounts = await Account.filter({ created_by: user.email });
      for (const account of accounts) {
        const openingBalance = account.opening_balance || 0;
        await Account.update(account.id, {
          balance: openingBalance,
          balance_eur: openingBalance * 1, // Assuming EUR as base, you might want to use exchange rates
          last_reconciled_date: null,
          last_reconciled_balance: null
        });
      }

      alert("All data has been successfully deleted and accounts have been reset to their opening balances.");
      
      // Notify parent component to refresh data
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error during start over:", error);
      alert("An error occurred while resetting your data. Please try again.");
    }
    setIsResetting(false);
    setConfirmText("");
  };

  return (
    <Card className="shadow-sm border-red-200 bg-red-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          Start Over - Delete All Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> This action will permanently delete ALL your financial data:
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>All transactions (income, expenses, transfers)</li>
              <li>All recurring transactions</li>
              <li>All transaction templates</li>
              <li>Account balances will be reset to opening balances</li>
            </ul>
            <p className="mt-2 font-semibold">This action CANNOT be undone!</p>
          </AlertDescription>
        </Alert>

        <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-white">
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-red-700 font-semibold">
              Type "DELETE ALL DATA" to confirm:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE ALL DATA"
              className="border-red-300 focus:border-red-500"
            />
          </div>

          <Button
            onClick={handleStartOver}
            disabled={confirmText !== "DELETE ALL DATA" || isResetting}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isResetting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Deleting All Data...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Data and Start Over
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}