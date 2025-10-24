import React, { useState, useEffect, useCallback } from "react";
import { User, RecurrentTransaction, TransactionTemplate, Account, Category } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Repeat, FileText } from "lucide-react";
import RecurrentTransactionList from "../components/recurring/RecurrentTransactionList";
import TransactionTemplateList from "../components/recurring/TransactionTemplateList";

export default function RecurringPage() {
    const [recurrentTransactions, setRecurrentTransactions] = useState([]);
    const [transactionTemplates, setTransactionTemplates] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const user = await User.me();
            setCurrentUser(user);

            const [recTrans, tempTrans, accData, catData] = await Promise.all([
                RecurrentTransaction.filter({ created_by: user.email }),
                TransactionTemplate.filter({ created_by: user.email }),
                Account.filter({ created_by: user.email }),
                Category.filter({ created_by: user.email })
            ]);

            setRecurrentTransactions(recTrans);
            setTransactionTemplates(tempTrans);
            setAccounts(accData);
            setCategories(catData);
        } catch (error) {
            console.error("Error loading recurring data:", error);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Repeat className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Recurring & Templates</h1>
                    <p className="text-slate-600">Automate your finances and speed up data entry.</p>
                </div>
            </div>

            <Tabs defaultValue="recurring">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recurring" className="flex items-center gap-2">
                        <Repeat className="w-4 h-4" /> Recurring Transactions
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Transaction Templates
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="recurring" className="mt-6">
                    <RecurrentTransactionList
                        recurrentTransactions={recurrentTransactions}
                        accounts={accounts}
                        categories={categories}
                        currentUser={currentUser}
                        isLoading={isLoading}
                        onDataChange={loadData}
                    />
                </TabsContent>
                <TabsContent value="templates" className="mt-6">
                    <TransactionTemplateList
                        transactionTemplates={transactionTemplates}
                        accounts={accounts}
                        categories={categories}
                        currentUser={currentUser}
                        isLoading={isLoading}
                        onDataChange={loadData}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}