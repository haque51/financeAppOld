import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, Settings, LogOut, ChevronDown, Sun, Moon, Laptop } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UserMenu({ onThemeChange }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (onThemeChange) {
            onThemeChange(user.theme || 'system');
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setCurrentUser(null);
      }
      setIsLoading(false);
    };
    loadUser();
  }, [onThemeChange]);

  const handleLogout = async () => {
    try {
      await User.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleThemeChange = async (newTheme) => {
    if (!currentUser) return;
    try {
      await User.updateMyUserData({ theme: newTheme });
      setCurrentUser(prev => ({ ...prev, theme: newTheme }));
      if (onThemeChange) {
        onThemeChange(newTheme);
      }
    } catch (error) {
      console.error("Failed to update theme", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg w-full justify-start">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {currentUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-semibold text-foreground text-sm truncate">
              {currentUser.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser.email}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to={createPageUrl("Settings")} className="flex items-center gap-2 w-full">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun className="w-4 h-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                <Sun className="w-4 h-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleThemeChange('system')}>
                <Laptop className="w-4 h-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 dark:text-red-500"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
