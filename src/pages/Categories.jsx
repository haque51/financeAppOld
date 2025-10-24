
import React, { useState, useEffect, useCallback } from "react";
import { Category, Transaction, User } from "@/api/entities"; // Removed RecurrentTransaction, TransactionTemplate as they are not used here
import { GenerateImage } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FolderTree } from "lucide-react"; // Removed FileText, Repeat as they are not used here

import CategoryCard from "../components/categories/CategoryCard";
import CategoryForm from "../components/categories/CategoryForm";
import CategoryStats from "../components/categories/CategoryStats";

const DEFAULT_CATEGORIES = {
    expense: [
        { name: 'Immediate Obligations', sub: ['Rent/Mortgage', 'Utilities', 'Internet', 'Mobile Phone', 'Home Insurance', 'Health Insurance', 'Auto Insurance', 'Loan Payment'] },
        { name: 'Food & Dining', sub: ['Groceries', 'Restaurants', 'Coffee Shops', 'Alcohol & Bars'] },
        { name: 'Personal', sub: ['Clothing', 'Haircut', 'Cosmetics', 'Subscriptions'] },
        { name: 'Transportation', sub: ['Fuel', 'Public Transport', 'Car Maintenance', 'Parking', 'Auto Registration'] },
        { name: 'Health & Wellness', sub: ['Pharmacy', 'Doctor', 'Dentist', 'Eyecare', 'Fitness'] },
        { name: 'Shopping', sub: ['Home Supplies', 'Electronics', 'Software', 'Hobbies', 'Books', 'Gifts'] },
        { name: 'Entertainment', sub: ['Movies', 'Concerts', 'Games', 'Travel'] },
        { name: 'Financial', sub: ['Bank Fees', 'Taxes', 'Charity'] },
    ],
    income: [
        { name: 'Wages', sub: ['Salary', 'Bonus', 'Commission'] },
        { name: 'Other Income', sub: ['Investment', 'Gift', 'Rental Income'] },
    ]
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("expense");
  const [isSettingUp, setIsSettingUp] = useState(false);

  const setupDefaultCategories = useCallback(async (user) => {
    setIsSettingUp(true);
    try {
        for (const type in DEFAULT_CATEGORIES) {
            for (const cat of DEFAULT_CATEGORIES[type]) {
                // Remove AI icon generation from default setup for speed and consistency
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
                            // Subcategories usually don't need separate icons unless specified
                        });
                    }
                }
            }
        }
    } catch(e) {
        console.error("Failed to set up default categories", e);
    } finally {
        setIsSettingUp(false);
        // After setting up defaults, reload all data
        // We'll call loadData from the place that called setupDefaultCategories instead
    }
  }, []); // Empty dependency array as it only depends on fixed data and async calls

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      const [categoriesData, transactionsData] = await Promise.all([
        Category.filter({ created_by: user.email }, '-created_date'),
        Transaction.filter({ created_by: user.email }, '-created_date')
      ]);
      
      setCategories(categoriesData);
      setTransactions(transactionsData);

      // If no categories exist for the user, set up defaults
      if (categoriesData.length === 0 && user) {
        await setupDefaultCategories(user);
        // After setup, reload data again to show the newly created categories
        const reloadedCategoriesData = await Category.filter({ created_by: user.email }, '-created_date');
        setCategories(reloadedCategoriesData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  }, [setupDefaultCategories]); // Added setupDefaultCategories to dependencies

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddNew = (type = activeTab, parentId = null) => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (categoryId) => {
    // Check if category has transactions
    const categoryTransactions = transactions.filter(t => 
      t.category_id === categoryId || t.subcategory_id === categoryId
    );
    
    if (categoryTransactions.length > 0) {
      if (!window.confirm(`This category has ${categoryTransactions.length} transactions. Deleting it will remove the category from these transactions. Continue?`)) {
        return;
      }
    }

    // Check if category has subcategories
    const subcategories = categories.filter(c => c.parent_id === categoryId);
    if (subcategories.length > 0) {
      if (!window.confirm(`This category has ${subcategories.length} subcategories. Deleting it will also delete all subcategories. Continue?`)) {
        return;
      }
      
      // Delete subcategories first
      for (const subcategory of subcategories) {
        await Category.delete(subcategory.id);
      }
    }

    try {
      await Category.delete(categoryId);
      loadData();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  const handleSave = async (formData) => {
    try {
      let categoryData = {
        ...formData,
        created_by: currentUser.email, // Ensure new categories are associated with the current user
      };

      if (editingCategory && editingCategory.id) {
        // If editing, only update existing data, keep icon_url if not explicitly changed
        await Category.update(editingCategory.id, categoryData);
      } else {
        // AI Icon Generation for new categories only if no icon is explicitly provided
        if (!categoryData.icon_url) {
          try {
            const iconPrompt = `a simple, modern, flat icon for a financial category: ${formData.name}, on a plain white background, vector art, minimal design`;
            const imageResult = await GenerateImage({ prompt: iconPrompt });
            if (imageResult.url) {
              categoryData.icon_url = imageResult.url;
            }
          } catch (error) {
            console.warn("Could not generate category icon:", error);
            // Continue without an icon if generation fails
          }
        }
        
        await Category.create({
          ...categoryData,
          type: editingCategory?.type || activeTab // Use type from editingCategory if it's a subcategory creation, else activeTab
        });
      }

      setIsFormOpen(false);
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category.");
    }
  };

  const handleAddSubcategory = (parentCategory) => {
    setEditingCategory({ parent_id: parentCategory.id, type: parentCategory.type });
    setIsFormOpen(true);
  };

  const getCategoriesByType = (type) => {
    return categories.filter(c => c.type === type && !c.parent_id);
  };

  const getSubcategories = (parentId) => {
    return categories.filter(c => c.parent_id === parentId);
  };

  const getCategoryTransactionCount = (categoryId) => {
    return transactions.filter(t => 
      t.category_id === categoryId || t.subcategory_id === categoryId
    ).length;
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-600 mt-1">Organize your income and expenses</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleAddNew(activeTab)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory && editingCategory.id ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              defaultType={activeTab}
              onSubmit={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingCategory(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CategoryStats 
        categories={categories} 
        transactions={transactions}
        isLoading={isLoading}
      />
      
      {isSettingUp && (
        <div className="text-center p-8 bg-blue-50 rounded-lg">
            <p className="font-semibold text-blue-700">One moment... we're setting up some smart categories for you!</p>
            <p className="text-sm text-blue-600">This only happens once.</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="expense" className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Expenses
          </TabsTrigger>
          <TabsTrigger value="income" className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Income
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Transfer
          </TabsTrigger>
        </TabsList>

        {["expense", "income", "transfer"].map((type) => (
          <TabsContent key={type} value={type} className="space-y-6 mt-6">
            <div className="grid gap-6">
              {isLoading || isSettingUp ? ( // Also show skeleton if setting up
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array(3).fill(0).map((_, i) => (
                    <CategoryCard.Skeleton key={i} />
                  ))}
                </div>
              ) : (
                <>
                  {getCategoriesByType(type).length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-300 rounded-xl">
                      <FolderTree className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        No {type} categories yet
                      </h3>
                      <p className="text-slate-500 mb-4">
                        Create your first {type} category to start organizing your transactions.
                      </p>
                      <Button 
                        onClick={() => handleAddNew(type)} 
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add {type} Category
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getCategoriesByType(type).map((category) => (
                        <CategoryCard
                          key={category.id}
                          category={category}
                          subcategories={getSubcategories(category.id)}
                          transactionCount={getCategoryTransactionCount(category.id)}
                          onEdit={() => handleEdit(category)}
                          onDelete={() => handleDelete(category.id)}
                          onAddSubcategory={() => handleAddSubcategory(category)}
                          onEditSubcategory={handleEdit}
                          onDeleteSubcategory={handleDelete}
                          getSubcategoryTransactionCount={getCategoryTransactionCount}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
