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
import { Badge } from "@/components/ui/badge";
import { Globe, RefreshCw, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";

const CURRENCIES = [
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" }
];

export default function CurrencySettings({ 
  exchangeRates, 
  user, 
  onRefreshRates, 
  onUpdate, 
  isRefreshingRates,
  isSaving 
}) {
  const [selectedBaseCurrency, setSelectedBaseCurrency] = useState(user?.base_currency || "EUR");

  const handleBaseCurrencyChange = async () => {
    await onUpdate({ base_currency: selectedBaseCurrency });
  };

  return (
    <div className="grid gap-6">
      <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-slate-600" />
            Base Currency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Choose your primary currency. All amounts will be converted to this currency for reporting and analysis.
          </p>
          
          <div className="space-y-3">
            <Label htmlFor="base_currency">Base Currency</Label>
            <div className="flex gap-3">
              <Select
                value={selectedBaseCurrency}
                onValueChange={setSelectedBaseCurrency}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{currency.code}</span>
                        <span className="text-slate-500">{currency.name}</span>
                        <span className="text-sm">{currency.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedBaseCurrency !== user?.base_currency && (
                <Button 
                  onClick={handleBaseCurrencyChange}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Current Base Currency</span>
            </div>
            <p className="text-sm text-blue-700">
              {CURRENCIES.find(c => c.code === user?.base_currency)?.name || "Euro"} 
              ({user?.base_currency || "EUR"})
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-slate-600" />
            Exchange Rates
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshRates}
            disabled={isRefreshingRates}
            className="gap-2"
          >
            {isRefreshingRates ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Refresh Rates
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Current exchange rates used for currency conversion. Rates are fetched from live market data.
          </p>

          <div className="grid gap-3">
            {Object.entries(exchangeRates).map(([currency, rate]) => {
              const currencyInfo = CURRENCIES.find(c => c.code === currency);
              if (!currencyInfo || currency === 'EUR') return null;
              
              return (
                <div 
                  key={currency}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                      <span className="font-bold text-slate-700">{currencyInfo.symbol}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{currencyInfo.name}</p>
                      <p className="text-sm text-slate-500">{currency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      1 {currency} = €{rate.toFixed(4)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Live Rate
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
            <Clock className="w-3 h-3" />
            <span>Last updated: {format(new Date(), 'MMM d, yyyy HH:mm')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}