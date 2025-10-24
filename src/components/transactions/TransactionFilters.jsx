import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";

export default function TransactionFilters({ 
  filters, 
  accounts, 
  categories, 
  onFiltersChange 
}) {
  const handleChange = (field, value) => {
    onFiltersChange(prev => ({ ...prev, [field]: value }));
  };

  const mainCategories = categories.filter(c => !c.parent_id);

  return (
    <Card className="shadow-sm border-slate-200 bg-white/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="w-5 h-5 text-slate-600" />
          Filter Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </Label>
            <Input
              id="search"
              placeholder="Payee or memo..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Account</Label>
            <Select
              value={filters.account}
              onValueChange={(value) => handleChange("account", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <Select
              value={filters.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {mainCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">From Date</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleChange("dateFrom", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">To Date</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleChange("dateTo", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
