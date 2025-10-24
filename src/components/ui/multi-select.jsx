import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X } from 'lucide-react';

export function MultiSelect({ options = [], selected = [], onChange, placeholder = "Select items..." }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const handleRemove = (value, e) => {
    e.stopPropagation();
    onChange(selected.filter(item => item !== value));
  };

  const selectedLabels = selected.map(value => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between text-left h-auto min-h-[40px] p-2">
          <div className="flex flex-wrap gap-1">
            {selectedLabels.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              selectedLabels.map((label, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {label}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={(e) => handleRemove(selected[index], e)}
                  />
                </Badge>
              ))
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={selected.includes(option.value)}
                onCheckedChange={() => handleToggle(option.value)}
              />
              <label
                htmlFor={option.value}
                className="text-sm cursor-pointer flex-1"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}