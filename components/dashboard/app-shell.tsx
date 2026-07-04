'use client'

import {
  BarChart3,
  Bell,
  FileText,
  Home,
  Menu,
  Package,
  Search,
  Settings,
  Users,
  X,
  LogOut,
  User,
  Command,
  ChevronDown,
  Grid3x3,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { mockUserProfile, mockNotifications } from '@/lib/dashboard-data'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Overview' },
  { href: '/dashboard/invoices', icon: FileText, label: 'Invoices' },
  { href: '/dashboard/clients', icon: Users, label: 'Clients' },
  { href: '/dashboard/products', icon: Package, label: 'Products' },
  { href: '/dashboard/templates', icon: Grid3x3, label: 'Templates' },
]

const adminItems = [
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/team', icon: Users, label: 'Team' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const unreadNotifications = mockNotifications.filter((n) => !n.read)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setUserMenuOpen(false)
        setNotificationsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchOpen])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground text-sm font-bold">
              TF
            </div>
            <span className="text-foreground">ToolForge</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="hidden rounded-lg p-1 hover:bg-sidebar-accent sm:inline-flex lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-6">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/60">
            Main
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            )
          })}

          <p className="mb-4 mt-8 px-3 text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/60">
            Admin
          </p>
          {adminItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 hover:bg-muted lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            <div className="flex flex-1 items-center justify-center px-4 lg:justify-start">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:w-96"
              >
                <Search className="size-4" />
                <span>Search...</span>
                <span className="ml-auto hidden font-mono text-xs text-muted-foreground sm:inline">
                  ⌘K
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen)
                    setUserMenuOpen(false)
                  }}
                  className="relative rounded-lg p-2 hover:bg-muted"
                >
                  <Bell className="size-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-14 z-50 w-80 rounded-lg border border-border bg-card shadow-lg">
                    <div className="border-b border-border p-4">
                      <h2 className="font-semibold">Notifications</h2>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {mockNotifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        mockNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`border-b border-border p-4 hover:bg-muted/50 ${
                              !notif.read ? 'bg-muted/30' : ''
                            }`}
                          >
                            <p className="font-medium text-foreground">{notif.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{notif.message}</p>
                            <p className="mt-2 text-xs text-muted-foreground">{notif.timestamp}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen)
                    setNotificationsOpen(false)
                  }}
                  className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                    {mockUserProfile.avatar}
                  </div>
                  <span className="hidden text-sm font-medium sm:inline">
                    {mockUserProfile.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="hidden size-4 text-muted-foreground sm:inline" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-14 z-50 w-48 rounded-lg border border-border bg-card shadow-lg">
                    <div className="p-4 border-b border-border">
                      <p className="font-medium">{mockUserProfile.name}</p>
                      <p className="text-sm text-muted-foreground">{mockUserProfile.email}</p>
                    </div>
                    <nav className="space-y-1 p-2">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="size-4" />
                        Profile
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="size-4" />
                        Settings
                      </Link>
                      <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-destructive/10 text-destructive">
                        <LogOut className="size-4" />
                        Logout
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {searchOpen && (
            <div className="fixed inset-0 z-40 bg-black/50">
              <div className="flex items-start justify-center pt-16">
                <div className="w-full max-w-2xl rounded-lg bg-card p-4">
                  <div className="flex items-center gap-2 rounded-lg border border-border px-4 py-3">
                    <Command className="size-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search invoices, clients, products..."
                      className="flex-1 bg-transparent outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="p-3 hover:bg-muted rounded-lg cursor-pointer">
                      <p className="font-medium">Quick Actions</p>
                      <p className="text-sm text-muted-foreground">Create new invoice</p>
                    </div>
                    <div className="p-3 hover:bg-muted rounded-lg cursor-pointer">
                      <p className="font-medium">Invoices</p>
                      <p className="text-sm text-muted-foreground">View all invoices</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
