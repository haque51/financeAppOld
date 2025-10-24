
import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreVertical, Edit, Trash2, Plus, ChevronDown, ChevronRight, Tag, Receipt,
  Home, Landmark, Zap, UtensilsCrossed, ShoppingCart, Car, Fuel, Bus, Smile, Shirt, HeartPulse, Ticket, Gift, Banknote, Briefcase, HandCoins,
  Shield, Phone, Wifi, Droplets, Flame, Wrench, Building, FileText, Smartphone,
  ParkingCircle, ClipboardCheck, ShoppingBasket, Coffee, Beer, Stethoscope, Pilcrow, Brain, Glasses, ShieldCheck,
  CreditCard, GraduationCap, Users, Baby, Dog, Sparkles, HandHeart, Clapperboard, Music, BookOpen, Gamepad2, Paintbrush, Code,
  Scale, Plane, BedDouble, Map, Briefcase as BriefcaseIcon, Tag as DefaultIcon, Laptop
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const typeColors = {
  income: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  expense: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  transfer: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
};

const categoryIcons = {
  // Parent Expense Categories (YNAB-inspired)
  'Housing': Home,
  'Transportation': Car,
  'Food & Drink': UtensilsCrossed,
  'Health & Medical': Stethoscope,
  'Insurance': Shield,
  'Debt & Loans': Landmark,
  'Shopping & Household': ShoppingCart,
  'Personal & Family': Users,
  'Entertainment & Subscriptions': Ticket,
  'Taxes & Government & Fees': Landmark,
  'Travel & Experiences': Plane,

  // Parent Income Categories
  'Wages': Briefcase,
  'Other Income': HandCoins,

  // Subcategories
  // Housing
  'Rent/Mortgage': Home,
  'Maintenance & Repairs': Wrench,
  'HOA/Condo Fees': Building,
  'Property Tax': FileText,
  'Utilities & Bills': Receipt,
  'Electricity': Zap,
  'Gas/Heating': Flame,
  'Water/Sewer/Trash': Droplets,
  'Internet': Wifi,
  'Mobile Phone': Smartphone,

  // Transportation
  'Fuel': Fuel,
  'Public Transit': Bus,
  'Rideshare/Taxi': Car,
  'Parking & Tolls': ParkingCircle,
  'Registration/Inspection': ClipboardCheck,

  // Food & Drink
  'Groceries': ShoppingBasket,
  'Restaurants': UtensilsCrossed,
  'Takeout/Delivery': ShoppingCart,
  'Coffee & Snacks': Coffee,
  'Bars/Alcohol': Beer,

  // Health & Medical
  'Doctor/Dentist/Clinic': Stethoscope,
  'Pharmacy': Pilcrow,
  'Mental Health': Brain,
  'Vision': Glasses,
  'Medical Devices': HeartPulse,

  // Insurance
  'Health Insurance': ShieldCheck,
  'Auto Insurance': ShieldCheck,
  'Home/Renter’s Insurance': ShieldCheck,
  'Life/Disability': ShieldCheck,
  'Other Insurance': Shield,

  // Debt & Loans
  'Credit Card Payment': CreditCard,
  'Student Loan': GraduationCap,
  'Auto Loan/Lease': Car,
  'Personal Loan': Landmark,

  // Shopping & Household
  'Household Supplies': ShoppingBasket,
  'Furniture/Appliance': BedDouble,
  'Electronics': Laptop,
  'Clothing & Accessories': Shirt,
  'Office/School Supplies': BookOpen,

  // Personal & Family
  'Personal Care (hair, cosmetics, etc.)': Sparkles,
  'Childcare/Kids': Baby,
  'Pet Care': Dog,
  'Gifts & Donations': Gift,

  // Entertainment & Subscriptions
  'Streaming Services': Clapperboard,
  'Music/Books/Games': Music,
  'Events/Movies/Concerts': Ticket,
  'Hobbies': Paintbrush,
  'Apps/Software': Code,

  // Taxes & Government & Fees
  'Income Tax': FileText,
  'Other Taxes & Duties': FileText,
  'Bank Fees': Landmark,
  'Interest & Late Fees': Scale,

  // Travel & Experiences
  'Flights/Long-distance Transport': Plane,
  'Lodging': BedDouble,
  'Local Transport/Car Rental': Car,
  'Activities/Tours': Map,
  'Trip Miscellaneous': BriefcaseIcon,

  // Income Subcategories
  'Salary': Briefcase,
  'Bonus': Banknote,
  'Commission': Banknote,
  'Investment': HandCoins,
  'Rental Income': Home,

  // Default fallback
  'Default': DefaultIcon
};

const CategoryCard = ({
  category,
  subcategories,
  transactionCount,
  onEdit,
  onDelete,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
  getSubcategoryTransactionCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const colors = typeColors[category.type] || typeColors.expense;
  const Icon = categoryIcons[category.name] || categoryIcons.Default;

  return (
    <Card className={`shadow-sm hover:shadow-md transition-all duration-300 border-slate-200 bg-white/80 backdrop-blur-sm`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${colors.bg}`}
              style={{ backgroundColor: category.icon_url ? 'transparent' : category.color || undefined }}
            >
              {category.icon_url ? (
                <img src={category.icon_url} alt={`${category.name} icon`} className="w-full h-full object-cover" />
              ) : (
                <Icon className={`w-5 h-5 ${category.color ? 'text-white' : colors.text}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-slate-900 truncate">
                {category.name}
              </CardTitle>
              <Badge
                variant="outline"
                className={`${colors.bg} ${colors.text} ${colors.border} text-xs mt-1`}
              >
                {category.type}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-500 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddSubcategory}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subcategory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-500">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Receipt className="w-4 h-4" />
            <span>{transactionCount} transactions</span>
          </div>
          {category.budget_amount && (
            <div className="text-xs text-slate-500">
              Budget: €{category.budget_amount}
            </div>
          )}
        </div>

        {subcategories.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between p-2 text-slate-600 hover:bg-slate-50"
              >
                <span className="text-sm font-medium">
                  {subcategories.length} subcategories
                </span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {subcategories.map((subcategory) => {
                const SubIcon = categoryIcons[subcategory.name] || categoryIcons.Default;
                return (
                  <div
                    key={subcategory.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-slate-200"
                      >
                        <SubIcon className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {subcategory.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {getSubcategoryTransactionCount(subcategory.id)} transactions
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-6 h-6 text-slate-400">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditSubcategory(subcategory)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteSubcategory(subcategory.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50/70 p-4 flex justify-between items-center">
        <div className="text-xs text-slate-500">
          {subcategories.length === 0 ? 'No subcategories' : `${subcategories.length} subcategories`}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddSubcategory}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Sub
        </Button>
      </CardFooter>
    </Card>
  );
};

CategoryCard.Skeleton = function CategoryCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
      <CardFooter className="bg-slate-50/70 p-4">
        <Skeleton className="h-4 w-full" />
      </CardFooter>
    </Card>
  );
};

export default CategoryCard;
