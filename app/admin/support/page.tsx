"use client"

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  HelpCircle, 
  Search, 
  Filter,
  RefreshCw,
  Download,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react'
import api from '@/lib/api-client'
import toast from 'react-hot-toast'

interface SupportTicket {
  _id: string
  user: {
    _id: string
    name: string
    email: string
    businessName?: string
  }
  subject: string
  description: string
  status: string
  priority: string
  category: string
  createdAt: string
  updatedAt: string
  assignedTo?: string
  messages?: Array<{
    _id: string
    sender: string
    message: string
    timestamp: string
  }>
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  })

  const fetchTickets = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      const mockTickets: SupportTicket[] = [
        {
          _id: '1',
          user: {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            businessName: 'Tech Mobile Center'
          },
          subject: 'Subscription billing issue',
          description: 'I was charged twice for my Pro subscription this month',
          status: 'open',
          priority: 'high',
          category: 'billing',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          user: {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            businessName: 'Mobile World'
          },
          subject: 'Cannot upload product images',
          description: 'Getting error when trying to upload product images',
          status: 'in_progress',
          priority: 'medium',
          category: 'technical',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          user: {
            _id: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            businessName: 'Phone Store'
          },
          subject: 'Storefront customization help',
          description: 'Need help customizing my storefront theme',
          status: 'resolved',
          priority: 'low',
          category: 'general',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      
      setTickets(mockTickets)
      
      // Calculate stats
      const total = mockTickets.length
      const open = mockTickets.filter(t => t.status === 'open').length
      const inProgress = mockTickets.filter(t => t.status === 'in_progress').length
      const resolved = mockTickets.filter(t => t.status === 'resolved').length
      const closed = mockTickets.filter(t => t.status === 'closed').length
      
      setStats({ total, open, inProgress, resolved, closed })
    } catch (error) {
      console.error('Error fetching tickets:', error)
      toast.error('Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      // Mock update - replace with actual API call
      setTickets(prev => prev.map(ticket => 
        ticket._id === ticketId 
          ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
          : ticket
      ))
      
      toast.success(`Ticket ${newStatus === 'resolved' ? 'resolved' : 'updated'}`)
      fetchTickets()
    } catch (error) {
      console.error('Error updating ticket status:', error)
      toast.error('Failed to update ticket status')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Open</span>
      case 'in_progress':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">In Progress</span>
      case 'resolved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Resolved</span>
      case 'closed':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Closed</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">High</span>
      case 'medium':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Medium</span>
      case 'low':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Low</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{priority}</span>
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchTerm || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="admin" />
        
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Support Tickets
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage customer support tickets and inquiries
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={fetchTickets} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <HelpCircle className="h-6 w-6 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open</p>
                      <p className="text-2xl font-bold text-red-600">{stats.open}</p>
                    </div>
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                    </div>
                    <Clock className="h-6 w-6 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                      <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Closed</p>
                      <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                    </div>
                    <XCircle className="h-6 w-6 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="all">All Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Support Tickets ({filteredTickets.length})
                </CardTitle>
                <CardDescription>
                  Manage and respond to customer support tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No support tickets found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTickets.map((ticket) => (
                      <div key={ticket._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {ticket.subject}
                              </h3>
                              {getStatusBadge(ticket.status)}
                              {getPriorityBadge(ticket.priority)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {ticket.user.businessName || ticket.user.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateTicketStatus(ticket._id, 'in_progress')}
                              disabled={ticket.status === 'in_progress'}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Start
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTicketStatus(ticket._id, 'resolved')}
                              disabled={ticket.status === 'resolved'}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
