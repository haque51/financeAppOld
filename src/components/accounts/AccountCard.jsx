
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreVertical,
  Edit,
  Trash2,
  Landmark,
  CreditCard,
  PiggyBank,
  Wallet,
  Briefcase,
  TrendingUp
} from "lucide-react";
import { formatCurrency } from "../utils/CurrencyFormatter";

const accountIcons = {
  checking: { icon: Landmark, color: "text-blue-500", bg: "bg-blue-50" },
  savings: { icon: PiggyBank, color: "text-emerald-500", bg: "bg-emerald-50" },
  credit_card: { icon: CreditCard, color: "text-red-500", bg: "bg-red-50" },
  loan: { icon: Landmark, color: "text-orange-500", bg: "bg-orange-50" },
  brokerage: { icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-50" },
  investment: { icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
  cash: { icon: Wallet, color: "text-yellow-500", bg: "bg-yellow-50" },
  default: { icon: Landmark, color: "text-slate-500", bg: "bg-slate-50" },
};

const AccountCard = ({ account, onEdit, onDelete }) => {
  const { icon: Icon, color, bg } = accountIcons[account.type] || accountIcons.default;
  const isDebtAccount = account.type === 'loan' || account.type === 'credit_card';
  const isNegativeBalance = (account.balance || 0) < 0;

  const balanceShouldBeRed = isDebtAccount || isNegativeBalance;
  
  return (
    <Card className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300 border-slate-200 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg}`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">{account.name}</CardTitle>
              {account.institution && <p className="text-sm text-slate-500">{account.institution}</p>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-500">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-500">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Current Balance</p>
          <p className={`text-3xl font-bold ${balanceShouldBeRed ? "text-red-600" : "text-slate-800"}`}>
            {formatCurrency(account.balance || 0, account.currency, true, false)}
          </p>
          {account.currency !== 'EUR' && (
             <p className="text-sm text-slate-500">
               ≈ {formatCurrency(account.balance_eur || 0, 'EUR', true, true)}
             </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-slate-50/70 p-4">
         <p className="text-sm font-medium text-slate-600 capitalize">{account.type.replace('_', ' ')}</p>
         <div className={`px-2 py-1 text-xs font-bold rounded ${isDebtAccount ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
          {isDebtAccount ? 'DEBT' : 'ASSET'}
         </div>
      </CardFooter>
    </Card>
  );
};

AccountCard.Skeleton = function AccountCardSkeleton() {
    return (
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/70 p-4">
            <Skeleton className="h-5 w-24" />
        </CardFooter>
      </Card>
    )
}

export default AccountCard;
