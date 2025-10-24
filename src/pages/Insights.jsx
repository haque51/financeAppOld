
import React, { useState, useEffect, useCallback } from "react";
import { User, Transaction, Category, Account, SpendingAlert, CategorizationRule } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Zap, TrendingUp, AlertTriangle, Brain, Lightbulb, Target, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SpendingInsights from "../components/insights/SpendingInsights";
import SmartAlerts from "../components/insights/SmartAlerts";
import AIInsights from "../components/insights/AIInsights";
import AutoCategorizationRules from "../components/insights/AutoCategorizationRules";
import PeriodComparison from "../components/insights/PeriodComparison";

export default function InsightsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [spendingAlerts, setSpendingAlerts] = useState([]);
  const [categorizationRules, setCategorizationRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [transactionsData, categoriesData, accountsData, alertsData, rulesData] = await Promise.all([
        Transaction.filter({ created_by: user.email }, '-date'),
        Category.filter({ created_by: user.email, is_active: true }),
        Account.filter({ created_by: user.email, is_active: true }),
        SpendingAlert.filter({ created_by: user.email }),
        CategorizationRule.filter({ created_by: user.email })
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setAccounts(accountsData);
      setSpendingAlerts(alertsData);
      setCategorizationRules(rulesData);
    } catch (error) {
      console.error("Error loading insights data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Insights</h1>
          <p className="text-slate-600 mt-1">Smart analysis and automation for your finances.</p>
        </div>
      </div>

      <Tabs defaultValue="spending" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full">
          <TabsTrigger value="spending" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Spending</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Compare</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Auto Rules</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spending">
          <SpendingInsights
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="comparison">
          <PeriodComparison
            transactions={transactions}
            categories={categories}
            accounts={accounts}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <SmartAlerts
            alerts={spendingAlerts}
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            currentUser={currentUser}
            isLoading={isLoading}
            onDataChange={loadData}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AIInsights
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="rules">
          <AutoCategorizationRules
            rules={categorizationRules}
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
