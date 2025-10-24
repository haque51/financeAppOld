import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';

export default function ReportFilters({ accounts, categories, filters, onFiltersChange }) {

  const handleDateChange = (range) => {
    onFiltersChange(prev => ({ ...prev, dateRange: range }));
  };

  const handleMultiSelectChange = (field, values) => {
    onFiltersChange(prev => ({ ...prev, [field]: values }));
  };

  return (
    <Card className="shadow-sm border-slate-200 bg-white/80">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Date Range</label>
            <DateRangePicker
              range={filters.dateRange}
              onRangeChange={handleDateChange}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Accounts</label>
            <MultiSelect
              options={accounts.map(a => ({ value: a.id, label: a.name }))}
              selected={filters.accounts}
              onChange={(values) => handleMultiSelectChange('accounts', values)}
              placeholder="All Accounts"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Categories</label>
            <MultiSelect
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              selected={filters.categories}
              onChange={(values) => handleMultiSelectChange('categories', values)}
              placeholder="All Categories"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}