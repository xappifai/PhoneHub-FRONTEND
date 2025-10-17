"use client"

import React, { useMemo, useState, useEffect } from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Plus, Receipt, Filter, Loader2 } from 'lucide-react'
import { useLedgerStore } from '@/store/ledger-store'
import { useInventoryStore } from '@/store/inventory-store'
import toast from 'react-hot-toast'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', currencyDisplay: 'symbol' }).format(amount)
}

export default function LedgerPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'all' | 'sale' | 'expense'>('all')
  const [category, setCategory] = useState<'all' | 'Rent' | 'Utilities' | 'Salaries' | 'Marketing' | 'Transportation' | 'Supplies' | 'Taxes' | 'Custom'>('all')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  const { 
    transactions, 
    loading, 
    loadTransactions, 
    addSale, 
    addExpense, 
    exportExcel,
    getTotals
  } = useLedgerStore()
  const products = useInventoryStore(s => s.products)
  const loadProducts = useInventoryStore(s => s.loadProducts)

  // State for financial summaries
  const [todayTotals, setTodayTotals] = useState({ sales: 0, expenses: 0, profit: 0 })
  const [monthTotals, setMonthTotals] = useState({ sales: 0, expenses: 0, profit: 0 })
  const [loadingTotals, setLoadingTotals] = useState(false)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadTransactions(),
          loadProducts()
        ])
      } catch (error) {
        console.error('Failed to load ledger data:', error)
        toast.error('Failed to load ledger data')
      }
    }
    loadData()
  }, [loadTransactions, loadProducts])

  // Load financial totals
  useEffect(() => {
    const loadTotals = async () => {
      setLoadingTotals(true)
      try {
        const [todayData, monthData] = await Promise.all([
          getTotals('day'),
          getTotals('month')
        ])
        setTodayTotals(todayData)
        setMonthTotals(monthData)
      } catch (error) {
        console.error('Failed to load totals:', error)
        toast.error('Failed to load financial totals')
      } finally {
        setLoadingTotals(false)
      }
    }
    loadTotals()
  }, [getTotals])

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (type !== 'all' && t.type !== type) return false
      if (t.type === 'expense' && category !== 'all' && t.expenseCategory !== category) return false
      if (from && new Date(t.date) < new Date(from)) return false
      if (to && new Date(t.date) > new Date(to)) return false
      const hay = `${t.id} ${t.type} ${t.customerName || ''} ${t.description || ''} ${t.products?.map(p => p.name).join(' ') || ''}`.toLowerCase()
      return hay.includes(search.toLowerCase())
    })
  }, [transactions, search, type, category, from, to])

  const onExportXlsx = async () => {
    try {
      const csv = await exportExcel()
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ledger.xls'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Ledger exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export ledger')
    }
  }

  const printInvoice = (id: string) => {
    const tx = transactions.find(t => t.id === id)
    if (!tx || tx.type !== 'sale') return
    const vendor = { name: 'VendorHub Pakistan', phone: '+92-xxx', email: 'vendor@example.com' }
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Invoice ${id}</title>
      <style>body{font-family:Arial;padding:24px} h1{margin:0 0 8px} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{border:1px solid #ddd;padding:8px;text-align:left} .right{text-align:right}</style>
    </head><body>
      <h1>Invoice</h1>
      <div>Vendor: ${vendor.name} | ${vendor.phone} | ${vendor.email}</div>
      <div>Date: ${new Date(tx.date).toLocaleString()}</div>
      <table><thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>
        ${(tx.products||[]).map(p=>`<tr><td>${p.name}</td><td>${p.quantity}</td><td class="right">${p.unitPrice}</td><td class="right">${p.total}</td></tr>`).join('')}
      </tbody></table>
      <h2 class="right">Grand Total: ${formatCurrency(tx.amount)}</h2>
    </body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
  }

  const [saleOpen, setSaleOpen] = useState(false)
  const [expOpen, setExpOpen] = useState(false)

  const [saleForm, setSaleForm] = useState<{date: string; items: Array<{productId: string; quantity: number; unitPrice?: number}>; paymentMethod: any; customerName?: string}>({
    date: new Date().toISOString().slice(0,16),
    items: [],
    paymentMethod: 'Cash',
  })

  const [expForm, setExpForm] = useState<{date: string; category: any; description: string; amount: number; paymentMethod: any}>({
    date: new Date().toISOString().slice(0,10),
    category: 'Rent',
    description: '',
    amount: 0,
    paymentMethod: 'Cash'
  })

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="vendor" />
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Ledger</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setExpOpen(true)}>+ Expense</Button>
                <Button onClick={() => setSaleOpen(true)}><Plus className="h-4 w-4 mr-2"/>Record Sale</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Today's Sales</p>
                  {loadingTotals ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">{formatCurrency(todayTotals.sales)}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Today's Expenses</p>
                  {loadingTotals ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(todayTotals.expenses)}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">This Month Revenue</p>
                  {loadingTotals ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">{formatCurrency(monthTotals.sales)}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">This Month Profit</p>
                  {loadingTotals ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-secondary">{formatCurrency(monthTotals.profit)}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1">
                    <Input placeholder="Search transactions..." value={search} onChange={e=>setSearch(e.target.value)} />
                  </div>
                  <select value={type} onChange={e=>setType(e.target.value as any)} className="px-3 py-2 border rounded-md">
                    <option value="all">All Types</option>
                    <option value="sale">Sales</option>
                    <option value="expense">Expenses</option>
                  </select>
                  <select value={category} onChange={e=>setCategory(e.target.value as any)} className="px-3 py-2 border rounded-md">
                    <option value="all">All Categories</option>
                    {['Rent','Utilities','Salaries','Marketing','Transportation','Supplies','Taxes','Custom'].map(c=> <option key={c} value={c as any}>{c}</option>)}
                  </select>
                  <div className="flex items-center gap-2">
                    <Input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="w-[160px]" />
                    <span className="text-gray-500">to</span>
                    <Input type="date" value={to} onChange={e=>setTo(e.target.value)} className="w-[160px]" />
                  </div>
                    <Button variant="outline" onClick={()=>{setFrom('');setTo('');setCategory('all');setType('all');setSearch('')}}><Filter className="h-4 w-4 mr-2"/>Clear</Button>
                    <Button variant="outline" onClick={onExportXlsx} disabled={loading}>
                      <Download className="h-4 w-4 mr-2"/>
                      {loading ? 'Exporting...' : 'Export Excel'}
                    </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transactions ({filtered.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-gray-600">Loading transactions...</span>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
                        {filtered.map(t => (
                          <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-6 py-3 text-sm">{new Date(t.date).toLocaleString()}</td>
                            <td className="px-6 py-3 text-sm capitalize">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                t.type === 'sale' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {t.type}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm">
                              {t.type === 'sale' ? (
                                <div>
                                  <div className="text-gray-900">{t.products?.map(p=>`${p.name} x${p.quantity}`).join(', ')}</div>
                                  {t.customerName && <div className="text-xs text-gray-500">Customer: {t.customerName}</div>}
                                  {t.invoiceNumber && <div className="text-xs text-blue-500">Invoice: {t.invoiceNumber}</div>}
                                  {t.profitAmount !== undefined && (
                                    <div className="text-xs text-green-600">Profit: {formatCurrency(t.profitAmount)}</div>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <div className="text-gray-900">{t.expenseCategory}</div>
                                  <div className="text-xs text-gray-500">{t.description}</div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-3 text-sm">{t.paymentMethod}</td>
                            <td className="px-6 py-3 text-sm text-right font-semibold">
                              <span className={t.type === 'sale' ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(t.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-right">
                              {t.type === 'sale' && (
                                <Button variant="ghost" size="sm" onClick={()=>printInvoice(t.id)}>
                                  <Receipt className="h-4 w-4 mr-1"/>
                                  Invoice
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filtered.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No transactions found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Record Sale Modal (simple inline for MVP) */}
            {saleOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4">Record Sale</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm">Date & Time</label>
                      <Input type="datetime-local" value={saleForm.date} onChange={e=>setSaleForm({...saleForm, date: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm">Payment Method</label>
                      <select value={saleForm.paymentMethod} onChange={e=>setSaleForm({...saleForm, paymentMethod: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                        {['Cash','JazzCash','Easypaisa','Bank Transfer','Card Payment','Custom'].map(m=> <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm">Customer Name (optional)</label>
                      <Input value={saleForm.customerName||''} onChange={e=>setSaleForm({...saleForm, customerName: e.target.value})} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium">Items</label>
                    <div className="space-y-2 mt-2">
                      {saleForm.items.map((it, idx)=> (
                        <div key={idx} className="grid grid-cols-12 gap-2">
                          <select value={it.productId} onChange={e=>{
                            const items=[...saleForm.items]; items[idx].productId=e.target.value; setSaleForm({...saleForm, items})
                          }} className="col-span-5 px-3 py-2 border rounded-md">
                            <option value="">Select product</option>
                            {products.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <Input type="number" value={it.quantity} onChange={e=>{const items=[...saleForm.items]; items[idx].quantity=parseInt(e.target.value)||0; setSaleForm({...saleForm, items})}} className="col-span-2" placeholder="Qty" />
                          <Input type="number" step="0.01" value={it.unitPrice ?? ''} onChange={e=>{const items=[...saleForm.items]; items[idx].unitPrice=parseFloat(e.target.value)||0; setSaleForm({...saleForm, items})}} className="col-span-3" placeholder="Unit Price (optional)" />
                          <Button variant="outline" className="col-span-2" onClick={()=>{setSaleForm({...saleForm, items: saleForm.items.filter((_,i)=>i!==idx)})}}>Remove</Button>
                        </div>
                      ))}
                      <Button variant="outline" onClick={()=> setSaleForm({...saleForm, items: [...saleForm.items, { productId: '', quantity: 1 }]})}>+ Add Item</Button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={()=> setSaleOpen(false)}>Cancel</Button>
                    <Button onClick={async ()=>{
                      try {
                        await addSale({ 
                          date: new Date(saleForm.date).toISOString(), 
                          items: saleForm.items.filter(i=>i.productId), 
                          paymentMethod: saleForm.paymentMethod, 
                          customerName: saleForm.customerName 
                        })
                        toast.success('Sale recorded successfully')
                        setSaleOpen(false)
                        setSaleForm({date: new Date().toISOString().slice(0,16), items: [], paymentMethod: 'Cash'})
                      } catch (error) {
                        console.error('Failed to record sale:', error)
                        toast.error('Failed to record sale')
                      }
                    }}>Save</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Record Expense Modal */}
            {expOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-xl">
                  <h3 className="text-lg font-semibold mb-4">Record Expense</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm">Date</label>
                      <Input type="date" value={expForm.date} onChange={e=>setExpForm({...expForm, date: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm">Category</label>
                      <select value={expForm.category} onChange={e=>setExpForm({...expForm, category: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                        {['Rent','Utilities','Salaries','Marketing','Transportation','Supplies','Taxes','Custom'].map(c=> <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm">Description</label>
                      <Input value={expForm.description} onChange={e=>setExpForm({...expForm, description: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm">Amount</label>
                      <Input type="number" step="0.01" value={expForm.amount} onChange={e=>setExpForm({...expForm, amount: parseFloat(e.target.value)||0})} />
                    </div>
                    <div>
                      <label className="text-sm">Payment Method</label>
                      <select value={expForm.paymentMethod} onChange={e=>setExpForm({...expForm, paymentMethod: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                        {['Cash','JazzCash','Easypaisa','Bank Transfer','Card Payment','Custom'].map(m=> <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={()=> setExpOpen(false)}>Cancel</Button>
                    <Button onClick={async ()=>{
                      try {
                        await addExpense({ 
                          date: new Date(expForm.date).toISOString(), 
                          category: expForm.category, 
                          description: expForm.description, 
                          amount: expForm.amount, 
                          paymentMethod: expForm.paymentMethod 
                        })
                        toast.success('Expense recorded successfully')
                        setExpOpen(false)
                        setExpForm({date: new Date().toISOString().slice(0,10), category: 'Rent', description: '', amount: 0, paymentMethod: 'Cash'})
                      } catch (error) {
                        console.error('Failed to record expense:', error)
                        toast.error('Failed to record expense')
                      }
                    }}>Save</Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}


