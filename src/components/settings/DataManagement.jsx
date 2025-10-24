import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Category } from "@/api/entities";
import { AlertTriangle, RefreshCw, Trash2, PartyPopper } from "lucide-react";

// The default categories from your last request
const DEFAULT_CATEGORIES = {
    expense: [
        { name: 'Housing', sub: ['Rent/Mortgage', 'Maintenance & Repairs', 'HOA/Condo Fees', 'Property Tax', 'Utilities & Bills', 'Electricity', 'Gas/Heating', 'Water/Sewer/Trash', 'Internet', 'Mobile Phone'] },
        { name: 'Transportation', sub: ['Fuel', 'Public Transit', 'Rideshare/Taxi', 'Parking & Tolls', 'Maintenance & Repairs', 'Registration/Inspection'] },
        { name: 'Food & Drink', sub: ['Groceries', 'Restaurants', 'Takeout/Delivery', 'Coffee & Snacks', 'Bars/Alcohol'] },
        { name: 'Health & Medical', sub: ['Doctor/Dentist/Clinic', 'Pharmacy', 'Mental Health', 'Vision', 'Medical Devices'] },
        { name: 'Insurance', sub: ['Health Insurance', 'Auto Insurance', 'Home/Renter’s Insurance', 'Life/Disability', 'Other Insurance'] },
        { name: 'Debt & Loans', sub: ['Credit Card Payment', 'Student Loan', 'Auto Loan/Lease', 'Personal Loan'] },
        { name: 'Shopping & Household', sub: ['Household Supplies', 'Furniture/Appliances', 'Electronics', 'Clothing & Accessories', 'Office/School Supplies'] },
        { name: 'Personal & Family', sub: ['Personal Care (hair, cosmetics, etc.)', 'Childcare/Kids', 'Pet Care', 'Gifts & Donations' ] },
        { name: 'Entertainment & Subscriptions', sub: ['Streaming Services', 'Music/Books/Games', 'Events/Movies/Concerts', 'Hobbies', 'Apps/Software'] },
        { name: 'Taxes & Government & Fees', sub: ['Income Tax', 'Other Taxes & Duties', 'Bank Fees', 'Interest & Late Fees'] },
        { name: 'Travel & Experiences', sub: ['Flights/Long-distance Transport', 'Lodging', 'Local Transport/Car Rental', 'Activities/Tours', 'Trip Miscellaneous'] }
    ],
    income: [
        { name: 'Wages', sub: ['Salary', 'Bonus', 'Commission'] },
        { name: 'Other Income', sub: ['Investment', 'Gift', 'Rental Income'] },
    ]
};

export default function DataManagement({ user }) {
  const [isResetting, setIsResetting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleResetCategories = async () => {
    if (confirmText !== "RESET CATEGORIES") {
      alert('Please type "RESET CATEGORIES" to confirm.');
      return;
    }

    setIsResetting(true);
    setShowSuccessAlert(false);

    try {
      // 1. Delete all existing categories for the user
      const existingCategories = await Category.filter({ created_by: user.email });
      for (const category of existingCategories) {
        await Category.delete(category.id);
      }

      // 2. Setup default categories
      for (const type in DEFAULT_CATEGORIES) {
        for (const cat of DEFAULT_CATEGORIES[type]) {
          const parentCategory = await Category.create({
            name: cat.name,
            type: type,
            created_by: user.email,
          });

          if (parentCategory && cat.sub) {
            for (const subName of cat.sub) {
              await Category.create({
                name: subName,
                type: type,
                parent_id: parentCategory.id,
                created_by: user.email,
              });
            }
          }
        }
      }
      
      setShowSuccessAlert(true);

    } catch (error) {
      console.error("Error resetting categories:", error);
      alert("An error occurred while resetting categories. Please try again.");
    }

    setIsResetting(false);
    setConfirmText("");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
        {showSuccessAlert && (
            <Alert className="border-emerald-200 bg-emerald-50">
                <PartyPopper className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-800 font-semibold">Success!</AlertTitle>
                <AlertDescription className="text-emerald-700">
                    Your categories have been reset to the default settings.
                </AlertDescription>
            </Alert>
        )}
        <Card className="shadow-sm border-amber-200 bg-amber-50/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                    <RefreshCw className="w-5 h-5" />
                    Category Management
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-amber-900">
                    This action will delete all your current expense and income categories and replace them with the app's default list. This cannot be undone.
                </p>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="border-amber-300 bg-white hover:bg-amber-100/50">
                            Reset Categories to Default
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="text-red-500" />
                                Are you absolutely sure?
                            </DialogTitle>
                            <DialogDescription>
                                This will permanently delete all your existing categories and subcategories. Your transactions will not be deleted, but they will become uncategorized. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Label htmlFor="confirm-reset" className="font-bold text-red-600">
                                To confirm, please type "RESET CATEGORIES"
                            </Label>
                            <Input
                                id="confirm-reset"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="RESET CATEGORIES"
                                className="border-red-300 focus:border-red-500"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleResetCategories}
                                disabled={confirmText !== "RESET CATEGORIES" || isResetting}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {isResetting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        I understand, reset my categories
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    </div>
  );
}