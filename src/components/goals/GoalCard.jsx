import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Calendar, Link, Banknote } from 'lucide-react';
import { format, differenceInDays, formatDistanceToNowStrict } from 'date-fns';
import { formatCurrency } from '../utils/CurrencyFormatter';

export default function GoalCard({ goal, accounts, onEdit, onDelete }) {
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const daysLeft = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null;
  const linkedAccount = goal.linked_account_id ? accounts.find(acc => acc.id === goal.linked_account_id) : null;
  const amountNeeded = Math.max(0, goal.target_amount - goal.current_amount);
  const monthlyContribution = daysLeft && daysLeft > 0 ? (amountNeeded / (daysLeft / 30.44)) : 0;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col bg-white/80">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-slate-800">{goal.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-500">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {goal.notes && <p className="text-sm text-slate-500 pt-1">{goal.notes}</p>}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm font-medium text-emerald-600">Saved</span>
            <span className="text-sm font-medium text-slate-500">Target</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold text-emerald-600">{formatCurrency(goal.current_amount, 'EUR')}</span>
            <span className="text-lg font-semibold text-slate-500">{formatCurrency(goal.target_amount, 'EUR')}</span>
          </div>
          <Progress value={progress} className="mt-2" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{progress.toFixed(1)}% funded</span>
            <span>{formatCurrency(amountNeeded, 'EUR')} left</span>
          </div>
        </div>

        {monthlyContribution > 0 && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-center gap-3">
            <Banknote className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-800">{formatCurrency(monthlyContribution, 'EUR')}</p>
              <p className="text-xs text-blue-600">Suggested monthly contribution</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-slate-50/70 p-4 border-t flex flex-col items-start gap-2">
        {goal.target_date && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{format(new Date(goal.target_date), 'MMMM d, yyyy')}</span>
            <Badge variant="outline" className={daysLeft < 0 ? 'text-red-600' : ''}>
              {daysLeft > 0 ? `${formatDistanceToNowStrict(new Date(goal.target_date))} left` : "Overdue"}
            </Badge>
          </div>
        )}
        {linkedAccount && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link className="w-4 h-4" />
            <span className="font-medium">Linked to: {linkedAccount.name}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

GoalCard.Skeleton = function GoalCardSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50/70 p-4 border-t">
        <Skeleton className="h-5 w-full" />
      </CardFooter>
    </Card>
  );
}
