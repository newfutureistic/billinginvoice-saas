import { LucideIcon, TrendingUp, TrendingDown, DollarSign, FileText, Users, Package } from 'lucide-react'

// Types
export interface DashboardKPI {
  id: string
  label: string
  value: string | number
  change: number
  trend: 'up' | 'down'
  icon: LucideIcon
  color: 'brand' | 'success' | 'warning' | 'destructive'
}

export interface Invoice {
  id: string
  number: string
  client: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  date: string
  dueDate: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalSpent: number
  invoiceCount: number
  status: 'active' | 'inactive'
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  sku: string
  category: string
}

export interface Template {
  id: string
  name: string
  description: string
  thumbnail: string
  category: string
  used: number
}

export interface Team {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'user'
  status: 'active' | 'inactive'
  joinedDate: string
}

export interface Notification {
  id: string
  type: 'invoice' | 'payment' | 'system' | 'team'
  title: string
  message: string
  timestamp: string
  read: boolean
}

export interface ActivityLog {
  id: string
  action: string
  user: string
  timestamp: string
  details: string
}

// Mock KPIs
export const mockKPIs: DashboardKPI[] = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '$42,500',
    change: 12.5,
    trend: 'up',
    icon: DollarSign,
    color: 'brand',
  },
  {
    id: 'invoices',
    label: 'Invoices This Month',
    value: '24',
    change: 8.3,
    trend: 'up',
    icon: FileText,
    color: 'success',
  },
  {
    id: 'clients',
    label: 'Active Clients',
    value: '18',
    change: -2.1,
    trend: 'down',
    icon: Users,
    color: 'warning',
  },
  {
    id: 'products',
    label: 'Products Sold',
    value: '156',
    change: 23.7,
    trend: 'up',
    icon: Package,
    color: 'brand',
  },
]

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2024-001',
    client: 'Acme Corporation',
    amount: 5200,
    status: 'paid',
    date: '2024-01-15',
    dueDate: '2024-02-15',
  },
  {
    id: '2',
    number: 'INV-2024-002',
    client: 'Tech Startup Inc',
    amount: 3850,
    status: 'sent',
    date: '2024-02-01',
    dueDate: '2024-03-01',
  },
  {
    id: '3',
    number: 'INV-2024-003',
    client: 'Design Studio Pro',
    amount: 7200,
    status: 'overdue',
    date: '2024-01-20',
    dueDate: '2024-02-20',
  },
  {
    id: '4',
    number: 'INV-2024-004',
    client: 'Marketing Agency Ltd',
    amount: 4500,
    status: 'draft',
    date: '2024-02-10',
    dueDate: '2024-03-10',
  },
  {
    id: '5',
    number: 'INV-2024-005',
    client: 'Digital Solutions LLC',
    amount: 6200,
    status: 'paid',
    date: '2024-02-05',
    dueDate: '2024-03-05',
  },
]

// Mock Clients
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, New York, NY 10001',
    totalSpent: 18500,
    invoiceCount: 5,
    status: 'active',
  },
  {
    id: '2',
    name: 'Tech Startup Inc',
    email: 'contact@techstartup.com',
    phone: '+1 (555) 234-5678',
    address: '456 Innovation Ave, San Francisco, CA 94102',
    totalSpent: 12300,
    invoiceCount: 4,
    status: 'active',
  },
  {
    id: '3',
    name: 'Design Studio Pro',
    email: 'hello@designstudio.com',
    phone: '+1 (555) 345-6789',
    address: '789 Creative Blvd, Los Angeles, CA 90001',
    totalSpent: 8900,
    invoiceCount: 3,
    status: 'active',
  },
  {
    id: '4',
    name: 'Marketing Agency Ltd',
    email: 'info@marketingagency.com',
    phone: '+1 (555) 456-7890',
    address: '321 Marketing Dr, Chicago, IL 60601',
    totalSpent: 15600,
    invoiceCount: 6,
    status: 'inactive',
  },
  {
    id: '5',
    name: 'Digital Solutions LLC',
    email: 'support@digitalsolutions.com',
    phone: '+1 (555) 567-8901',
    address: '654 Tech Park, Seattle, WA 98101',
    totalSpent: 22400,
    invoiceCount: 8,
    status: 'active',
  },
]

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Professional Invoice Template',
    description: 'Premium invoice design with custom branding',
    price: 29.99,
    quantity: 142,
    sku: 'PROD-001',
    category: 'Templates',
  },
  {
    id: '2',
    name: 'Quote Generator',
    description: 'Professional quote creation tool',
    price: 39.99,
    quantity: 87,
    sku: 'PROD-002',
    category: 'Tools',
  },
  {
    id: '3',
    name: 'Contract Templates',
    description: 'Legally reviewed contract templates',
    price: 49.99,
    quantity: 56,
    sku: 'PROD-003',
    category: 'Templates',
  },
  {
    id: '4',
    name: 'Payment Tracking',
    description: 'Automated payment tracking and reminders',
    price: 19.99,
    quantity: 203,
    sku: 'PROD-004',
    category: 'Tools',
  },
]

// Mock Templates
export const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Classic',
    description: 'Clean and professional design',
    thumbnail: 'classic',
    category: 'Invoice',
    used: 342,
  },
  {
    id: '2',
    name: 'Modern',
    description: 'Contemporary layout with bold colors',
    thumbnail: 'modern',
    category: 'Invoice',
    used: 218,
  },
  {
    id: '3',
    name: 'Minimal',
    description: 'Minimalist approach, maximum clarity',
    thumbnail: 'minimal',
    category: 'Invoice',
    used: 156,
  },
  {
    id: '4',
    name: 'Corporate',
    description: 'Enterprise-grade professional design',
    thumbnail: 'corporate',
    category: 'Invoice',
    used: 421,
  },
]

// Mock Team Members
export const mockTeamMembers: Team[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'admin',
    status: 'active',
    joinedDate: '2023-06-15',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@company.com',
    role: 'manager',
    status: 'active',
    joinedDate: '2023-08-20',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@company.com',
    role: 'user',
    status: 'active',
    joinedDate: '2023-09-10',
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david@company.com',
    role: 'user',
    status: 'inactive',
    joinedDate: '2023-07-01',
  },
]

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Received',
    message: 'Invoice INV-2024-001 has been paid by Acme Corporation',
    timestamp: '2024-02-15 14:30',
    read: false,
  },
  {
    id: '2',
    type: 'invoice',
    title: 'Invoice Overdue',
    message: 'Invoice INV-2024-003 is now 5 days overdue',
    timestamp: '2024-02-14 09:15',
    read: false,
  },
  {
    id: '3',
    type: 'team',
    title: 'Team Member Added',
    message: 'Emily Rodriguez has been added to your team',
    timestamp: '2024-02-13 16:45',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'System Update',
    message: 'Dashboard has been updated with new features',
    timestamp: '2024-02-12 10:00',
    read: true,
  },
]

// Mock Activity Logs
export const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    action: 'Invoice Created',
    user: 'You',
    timestamp: '2024-02-15 14:30',
    details: 'Created invoice INV-2024-005 for Digital Solutions LLC',
  },
  {
    id: '2',
    action: 'Client Updated',
    user: 'Michael Chen',
    timestamp: '2024-02-15 11:20',
    details: 'Updated contact information for Tech Startup Inc',
  },
  {
    id: '3',
    action: 'Payment Recorded',
    user: 'You',
    timestamp: '2024-02-14 16:45',
    details: 'Recorded payment for INV-2024-001',
  },
  {
    id: '4',
    action: 'Template Created',
    user: 'Sarah Johnson',
    timestamp: '2024-02-14 09:30',
    details: 'Created new invoice template: "Luxury"',
  },
]

// Mock user profile
export const mockUserProfile = {
  id: 'user-1',
  name: 'Sarah Johnson',
  email: 'sarah@company.com',
  role: 'Admin',
  avatar: 'SJ',
  company: 'ToolForge Co',
  phone: '+1 (555) 123-4567',
  timezone: 'America/New_York',
}

// Revenue data for charts
export const mockRevenueData = [
  { month: 'Jan', revenue: 8400, invoices: 12 },
  { month: 'Feb', revenue: 9200, invoices: 15 },
  { month: 'Mar', revenue: 7800, invoices: 10 },
  { month: 'Apr', revenue: 11200, invoices: 18 },
  { month: 'May', revenue: 13500, invoices: 21 },
  { month: 'Jun', revenue: 12800, invoices: 19 },
]
