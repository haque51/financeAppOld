
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  MoreVertical,
  Edit,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  Receipt,
  Paperclip, // New icon
  Lock
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "../utils/CurrencyFormatter";

const typeIcons = {
  income: { icon: ArrowDownCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
  expense: { icon: ArrowUpCircle, color: "text-red-500", bg: "bg-red-50" },
  transfer: { icon: ArrowRightLeft, color: "text-blue-500", bg: "bg-blue-50" }
};

export default function TransactionList({ 
  transactions, 
  accounts, 
  categories, 
  isLoading, 
  onEdit, 
  onDelete 
}) {
  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getSubcategoryName = (subcategoryId) => {
    const category = categories.find(c => c.id === subcategoryId); // Assuming subcategories are also listed in the categories array
    return category ? category.name : '';
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-16 text-center">
          <Receipt className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Transactions Found</h3>
          <p className="text-slate-500">
            {accounts.length === 0 
              ? "Add some accounts first, then start tracking your transactions."
              : "Add your first transaction to get started tracking your finances."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Payee/Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subcategory</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const { icon: Icon, color, bg } = typeIcons[transaction.type];
                // 'account' variable is kept for potential future use or readability, though getAccountName could directly use transaction.account_id
                const account = accounts.find(a => a.id === transaction.account_id); 
                
                return (
                  <TableRow 
                    key={transaction.id} 
                    className="hover:bg-slate-50 border-b border-slate-100"
                  >
                    <TableCell>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{getAccountName(transaction.account_id)}</p>
                        {transaction.type === 'transfer' && transaction.to_account_id && (
                          <p className="text-xs text-slate-500">
                            → {getAccountName(transaction.to_account_id)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{transaction.payee}</p>
                        {transaction.receipt_url && (
                            <Paperclip className="w-3.5 h-3.5 text-slate-400" title="Receipt attached" />
                        )}
                      </div>
                        {transaction.memo && (
                          <p className="text-xs text-slate-500 truncate max-w-32">
                            {transaction.memo}
                          </p>
                        )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-slate-900">{getCategoryName(transaction.category_id)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-500">{getSubcategoryName(transaction.subcategory_id) || '-'}</p>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'income' 
                            ? 'text-emerald-600' 
                            : transaction.type === 'expense'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}>
                          {formatCurrency(transaction.amount || 0, transaction.currency, true, true)}
                        </p>
                        {transaction.currency !== 'EUR' && (
                          <p className="text-xs text-slate-500">
                            ≈ {formatCurrency(transaction.amount_eur || 0, 'EUR', true, true)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(transaction)} disabled={transaction.reconciled}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(transaction.id)}
                            className="text-red-500"
                            disabled={transaction.reconciled}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
