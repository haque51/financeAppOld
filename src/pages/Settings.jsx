
import React, { useState, useEffect, useCallback } from "react";
import { User, Account } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  DollarSign,
  RefreshCw,
  Target,
  CreditCard,
  Globe,
  Database
} from "lucide-react";

import UserProfile from "../components/settings/UserProfile";
import CurrencySettings from "../components/settings/CurrencySettings";
import FinancialGoals from "../components/settings/FinancialGoals";
import AccountDefaults from "../components/settings/AccountDefaults";
import DataManagement from "../components/settings/DataManagement";
import StartOver from "../components/settings/StartOver";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({ USD: 0.92, BDT: 0.0084, EUR: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      
      // Filter accounts by current user
      const accountsData = await Account.filter({ 
        created_by: userData.email, 
        is_active: true 
      });
      
      setCurrentUser(userData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  }, []);

  const fetchExchangeRates = useCallback(async () => {
    setIsRefreshingRates(true);
    try {
      const result = await InvokeLLM({
        prompt: "Get current exchange rates for USD to EUR and BDT to EUR. Provide accurate real-time rates.",
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            USD_to_EUR: { type: "number" },
            BDT_to_EUR: { type: "number" },
            last_updated: { type: "string" }
          }
        }
      });
      
      if (result.USD_to_EUR && result.BDT_to_EUR) {
        setExchangeRates({
          USD: result.USD_to_EUR,
          BDT: result.BDT_to_EUR,
          EUR: 1
        });
      }
    } catch (error) {
      console.warn("Could not fetch live rates, using defaults");
    }
    setIsRefreshingRates(false);
  }, []);

  useEffect(() => {
    loadData();
    fetchExchangeRates();
  }, [loadData, fetchExchangeRates]);

  const handleUserUpdate = async (userData) => {
    setIsSaving(true);
    try {
      await User.updateMyUserData(userData);
      setCurrentUser(prev => ({ ...prev, ...userData }));
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Failed to update user settings.");
    }
    setIsSaving(false);
  };

  const handleStartOverComplete = () => {
    // Reload data after start over
    loadData();
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-slate-200 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600">Manage your preferences and account settings</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Currency
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="defaults" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Defaults
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="reset" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <UserProfile 
            user={currentUser}
            onUpdate={handleUserUpdate}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="currency">
          <CurrencySettings
            exchangeRates={exchangeRates}
            user={currentUser}
            onRefreshRates={fetchExchangeRates}
            onUpdate={handleUserUpdate}
            isRefreshingRates={isRefreshingRates}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="goals">
          <FinancialGoals
            user={currentUser}
            onUpdate={handleUserUpdate}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="defaults">
          <AccountDefaults
            user={currentUser}
            accounts={accounts}
            onUpdate={handleUserUpdate}
            isSaving={isSaving}
          />
        </TabsContent>

        <TabsContent value="data">
          <DataManagement
            user={currentUser}
          />
        </TabsContent>

        <TabsContent value="reset">
          <StartOver
            user={currentUser}
            onComplete={handleStartOverComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
