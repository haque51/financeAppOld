
import React, { useState, useEffect, useMemo } from "react";
import { Account, Transaction, User } from "@/api/entities"; // Added User import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardCheck, Wallet, Milestone, Scale } from "lucide-react";
import { format, startOfMonth } from "date-fns";

export default function ReconciliationPage() {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // Added currentUser state
    const [isLoading, setIsLoading] = useState(true);
    const [statementDate, setStatementDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [statementBalance, setStatementBalance] = useState("");
    const [clearedTransactionIds, setClearedTransactionIds] = useState(new Set());

    useEffect(() => {
        const loadAccounts = async () => {
            setIsLoading(true);
            try {
                // Get current user first
                const user = await User.me();
                setCurrentUser(user);

                // Filter accounts by current user
                const accountsData = await Account.filter({ 
                    created_by: user.email, 
                    is_active: true 
                });
                setAccounts(accountsData);
            } catch (error) {
                console.error('Error loading accounts:', error);
            }
            setIsLoading(false);
        };
        loadAccounts();
    }, []);

    useEffect(() => {
        if (!selectedAccountId || !currentUser) { // Added currentUser check
            setTransactions([]);
            return;
        }
        const loadTransactions = async () => {
            setIsLoading(true);
            try {
                const account = accounts.find(a => a.id === selectedAccountId);
                if (!account) return;

                const filters = {
                    account_id: selectedAccountId,
                    created_by: currentUser.email, // Filter by current user
                    reconciled: false,
                };
                if (account.last_reconciled_date) {
                  // We fetch all unreconciled, and filter client-side up to statement date
                }
                
                const transData = await Transaction.filter(filters, '-date');
                setTransactions(transData);
                setClearedTransactionIds(new Set());
            } catch (error) {
                console.error('Error loading transactions:', error);
            }
            setIsLoading(false);
        };
        loadTransactions();
    }, [selectedAccountId, accounts, currentUser]); // Added currentUser to dependencies
    
    const selectedAccount = useMemo(() => accounts.find(a => a.id === selectedAccountId), [accounts, selectedAccountId]);

    const transactionsToDisplay = useMemo(() => {
        if (!statementDate) return [];
        return transactions.filter(t => new Date(t.date) <= new Date(statementDate));
    }, [transactions, statementDate]);

    const { beginningBalance, clearedBalance, difference } = useMemo(() => {
        const beginningBalance = selectedAccount?.last_reconciled_balance || 0;
        
        let totalCleared = 0;
        transactionsToDisplay.forEach(t => {
            if (clearedTransactionIds.has(t.id)) {
                if (t.type === 'expense' || (t.type === 'transfer' && t.account_id === selectedAccountId)) {
                    totalCleared -= t.amount;
                } else if (t.type === 'income') {
                    totalCleared += t.amount;
                } else if (t.type === 'transfer' && t.to_account_id === selectedAccountId) {
                    // This logic assumes cross-currency transfers are handled, simplified here.
                    // A better approach would be to have two transaction entries for a transfer.
                    // For now, let's assume transfers from this account are expenses.
                }
            }
        });

        const clearedBalance = beginningBalance + totalCleared;
        const difference = clearedBalance - (Number(statementBalance) || 0);

        return { beginningBalance, clearedBalance, difference };
    }, [selectedAccount, transactionsToDisplay, clearedTransactionIds, statementBalance, selectedAccountId]);

    const handleToggleTransaction = (txId) => {
        setClearedTransactionIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(txId)) {
                newSet.delete(txId);
            } else {
                newSet.add(txId);
            }
            return newSet;
        });
    };
    
    const handleFinishReconciliation = async () => {
        if (difference !== 0) {
            alert("Balance must match statement balance to finish reconciliation.");
            return;
        }

        setIsLoading(true);
        try {
            // Update transactions
            const updates = Array.from(clearedTransactionIds).map(id => Transaction.update(id, { reconciled: true }));
            await Promise.all(updates);

            // Update account
            await Account.update(selectedAccountId, {
                last_reconciled_date: statementDate,
                last_reconciled_balance: Number(statementBalance)
            });

            alert("Reconciliation successful!");
            setSelectedAccountId(""); // Reset view
        } catch (error) {
            console.error("Failed to finish reconciliation:", error);
            alert("An error occurred during reconciliation.");
        }
        setIsLoading(false);
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Account Reconciliation</h1>
                    <p className="text-slate-600">Match your records with your bank statements.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Account to Reconcile</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                        <SelectTrigger className="md:w-1/3">
                            <SelectValue placeholder="Choose an account..." />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {selectedAccount && (
                        <p className="text-sm text-slate-500 mt-2">
                            Last reconciled on {selectedAccount.last_reconciled_date ? format(new Date(selectedAccount.last_reconciled_date), 'PPP') : 'never'}
                        </p>
                    )}
                </CardContent>
            </Card>

            {selectedAccountId && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Statement Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="statement-date">Statement End Date</Label>
                                <Input id="statement-date" type="date" value={statementDate} onChange={e => setStatementDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="statement-balance">Statement Ending Balance ({selectedAccount.currency})</Label>
                                <Input id="statement-balance" type="number" placeholder="0.00" value={statementBalance} onChange={e => setStatementBalance(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Transactions to Clear</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-[500px] overflow-auto border rounded-lg">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-slate-50">
                                        <TableRow>
                                            <TableHead className="w-12"><Checkbox onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setClearedTransactionIds(new Set(transactionsToDisplay.map(t => t.id)));
                                                } else {
                                                    setClearedTransactionIds(new Set());
                                                }
                                            }} /></TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Payee</TableHead>
                                            <TableHead className="text-right">Charge</TableHead>
                                            <TableHead className="text-right">Payment</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactionsToDisplay.map(tx => (
                                            <TableRow key={tx.id} data-state={clearedTransactionIds.has(tx.id) && 'selected'}>
                                                <TableCell><Checkbox checked={clearedTransactionIds.has(tx.id)} onCheckedChange={() => handleToggleTransaction(tx.id)} /></TableCell>
                                                <TableCell>{format(new Date(tx.date), 'yyyy-MM-dd')}</TableCell>
                                                <TableCell>{tx.payee}</TableCell>
                                                <TableCell className="text-right text-red-600">
                                                    {(tx.type === 'expense' || tx.type === 'transfer') && `${tx.amount.toFixed(2)}`}
                                                </TableCell>
                                                <TableCell className="text-right text-emerald-600">
                                                    {tx.type === 'income' && `${tx.amount.toFixed(2)}`}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {transactionsToDisplay.length === 0 && !isLoading && <p className="text-center p-8 text-slate-500">No unreconciled transactions for this period.</p>}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Scale className="w-5 h-5"/>Reconciliation Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-3 gap-4 text-center">
                           <div className="p-4 bg-white rounded-lg border">
                               <p className="text-sm text-slate-500">Beginning Balance</p>
                               <p className="text-xl font-bold">€{beginningBalance.toFixed(2)}</p>
                           </div>
                           <div className="p-4 bg-white rounded-lg border">
                               <p className="text-sm text-slate-500">Cleared Balance</p>
                               <p className="text-xl font-bold">€{clearedBalance.toFixed(2)}</p>
                           </div>
                           <div className={`p-4 rounded-lg border ${difference === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                               <p className="text-sm">Difference</p>
                               <p className="text-xl font-bold">€{difference.toFixed(2)}</p>
                           </div>
                        </CardContent>
                    </Card>
                    
                    <div className="text-right">
                        <Button
                            onClick={handleFinishReconciliation}
                            disabled={difference !== 0 || isLoading || clearedTransactionIds.size === 0}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Finish Reconciling
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
