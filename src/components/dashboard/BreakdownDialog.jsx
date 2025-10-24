import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from '../utils/CurrencyFormatter';
import { Separator } from '@/components/ui/separator';

export default function BreakdownDialog({ open, onOpenChange, title, data, total, notes }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-slate-600 truncate pr-4">{item.label}</span>
                <span className={`font-medium ${item.value >= 0 ? 'text-slate-800' : 'text-red-500'}`}>
                  {formatCurrency(item.value, 'EUR')}
                </span>
              </div>
            ))}
            {data.length === 0 && (
              <p className="text-slate-500 text-center py-8">No items to display.</p>
            )}
          </div>
        </ScrollArea>
        {total !== undefined && (
           <>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-bold text-base">
                <span>Total</span>
                <span>{formatCurrency(total, 'EUR')}</span>
            </div>
           </>
        )}
        {notes && (
          <p className="text-xs text-slate-500 mt-4">{notes}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
