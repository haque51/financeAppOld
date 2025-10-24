import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Landmark, PiggyBank, Briefcase } from "lucide-react";

const accountIcons = {
  checking: Landmark,
  savings: PiggyBank,
  credit_card: CreditCard,
  investment: Briefcase,
  brokerage: Briefcase
};

export default function AccountDefaults({ user, accounts, onUpdate, isSaving }) {
  const [selectedDefaultAccount, setSelectedDefaultAccount] = useState(user?.default_account || "");

  const handleDefaultAccountChange = async () => {
    await onUpdate({ default_account: selectedDefaultAccount });
  };

  const defaultAccount = accounts.find(a => a.id === user?.default_account);

  return (
    <div className="grid gap-6">
      <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-600" />
            Default Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-600">
            Choose a default account that will be pre-selected when creating new transactions.
          </p>

          <div className="space-y-4">
            <Label htmlFor="default_account">Default Transaction Account</Label>
            <div className="flex gap-3">
              <Select
                value={selectedDefaultAccount}
                onValueChange={setSelectedDefaultAccount}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select default account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>No default account</SelectItem>
                  {accounts.map((account) => {
                    const Icon = accountIcons[account.type] || Landmark;
                    return (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{account.name}</span>
                          <span className="text-slate-500">({account.currency})</span>
                          <span className="text-xs text-slate-400 capitalize">
                            {account.type.replace('_', ' ')}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {selectedDefaultAccount !== user?.default_account && (
                <Button 
                  onClick={handleDefaultAccountChange}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </div>

          {defaultAccount && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3">
                {React.createElement(accountIcons[defaultAccount.type] || Landmark, {
                  className: "w-5 h-5 text-blue-600"
                })}
                <div>
                  <p className="font-medium text-blue-800">Current Default Account</p>
                  <p className="text-sm text-blue-700">
                    {defaultAccount.name} ({defaultAccount.currency}) - {defaultAccount.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {accounts.length === 0 && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-amber-800 font-medium">No accounts available</p>
              <p className="text-sm text-amber-700 mt-1">
                Create your first account to set it as default.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-900">{accounts.length}</p>
              <p className="text-sm text-slate-600">Total Accounts</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-emerald-600">
                {accounts.filter(a => a.type === 'checking' || a.type === 'savings').length}
              </p>
              <p className="text-sm text-slate-600">Bank Accounts</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-red-600">
                {accounts.filter(a => a.type === 'credit_card' || a.type === 'loan').length}
              </p>
              <p className="text-sm text-slate-600">Credit/Loans</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-blue-600">
                {accounts.filter(a => a.type === 'investment' || a.type === 'brokerage').length}
              </p>
              <p className="text-sm text-slate-600">Investments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
