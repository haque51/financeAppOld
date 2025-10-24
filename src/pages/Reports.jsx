
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Account, Category, Transaction } from '@/api/entities';
import { FilePieChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportFilters from '../components/reports/ReportFilters';
import ReportDisplay from '../components/reports/ReportDisplay';
import CustomReportBuilder from '../components/reports/CustomReportBuilder';

import { startOfMonth, endOfMonth } from 'date-fns';

export default function ReportsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState({
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
    accounts: [],
    categories: [],
  });

  const loadData = useCallback(async (user) => {
    setIsLoading(true);
    try {
      const [accountsData, categoriesData, transactionsData] = await Promise.all([
        Account.filter({ created_by: user.email }),
        Category.filter({ created_by: user.email }),
        Transaction.filter({ created_by: user.email }, '-date'),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error loading report data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        loadData(user);
      } catch (e) {
        setIsLoading(false);
      }
    };
    init();
  }, [loadData]);

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
      const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null;

      if (fromDate && transactionDate < fromDate) return false;
      if (toDate && transactionDate > toDate) return false;
      if (filters.accounts.length > 0 && !filters.accounts.includes(t.account_id)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(t.category_id)) return false;

      return true;
    });
  }, [transactions, filters]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
          <FilePieChart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-1">Analyze your financial data with powerful reporting tools.</p>
        </div>
      </div>

      <ReportFilters
        accounts={accounts}
        categories={categories.filter(c => !c.parent_id)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-1 md:grid-cols-2 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="custom">Report Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ReportDisplay
            data={filteredData}
            categories={categories}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="custom">
          <CustomReportBuilder
            data={filteredData}
            accounts={accounts}
            categories={categories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
