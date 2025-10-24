import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export function DateRangePicker({ range, onRangeChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFromChange = (e) => {
    const newFrom = e.target.value;
    onRangeChange({
      from: newFrom ? new Date(newFrom) : null,
      to: range?.to || null
    });
  };

  const handleToChange = (e) => {
    const newTo = e.target.value;
    onRangeChange({
      from: range?.from || null,
      to: newTo ? new Date(newTo) : null
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <Calendar className="mr-2 h-4 w-4" />
          {range?.from && range?.to
            ? `${format(range.from, 'MMM d')} - ${format(range.to, 'MMM d')}`
            : 'Pick a date range'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">From</label>
            <Input
              type="date"
              value={range?.from ? format(range.from, 'yyyy-MM-dd') : ''}
              onChange={handleFromChange}
            />
          </div>
          <div>
            <label className="text-sm font-medium">To</label>
            <Input
              type="date"
              value={range?.to ? format(range.to, 'yyyy-MM-dd') : ''}
              onChange={handleToChange}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}