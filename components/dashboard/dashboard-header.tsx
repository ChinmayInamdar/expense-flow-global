"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bell, Settings, LogOut, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardHeaderProps {
  user: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 dark:border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EF</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              ExpenseFlow
            </span>
            <Badge variant="secondary" className="text-xs dark:bg-slate-700 dark:text-slate-200">
              Global
            </Badge>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
            >
              Upload
            </Link>
            <Link
              href="/expenses"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
            >
              Expenses
            </Link>
            <Link
              href="/reconcile"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors"
            >
              Reconcile
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative dark:hover:bg-slate-800">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full dark:hover:bg-slate-800">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="dark:bg-slate-700 dark:text-slate-200">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 dark:bg-slate-900 dark:border-slate-700" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none dark:text-slate-100">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground dark:text-slate-400">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-slate-700" />
                <DropdownMenuItem asChild className="dark:hover:bg-slate-800">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="dark:hover:bg-slate-800">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-slate-700" />
                <DropdownMenuItem onClick={handleSignOut} className="dark:hover:bg-slate-800">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
