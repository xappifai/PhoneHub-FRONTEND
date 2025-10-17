import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useInventoryStore, ProductItem } from '@/store/inventory-store'
import api from '@/lib/api-client'

export type PaymentMethod = 'Cash' | 'JazzCash' | 'Easypaisa' | 'Bank Transfer' | 'Card Payment' | 'Custom'

export type TransactionType = 'sale' | 'expense'

export interface LedgerTransaction {
  id: string
  type: TransactionType
  date: string // ISO
  // sale fields
  products?: Array<{ productId: string; name: string; quantity: number; unitPrice: number; total: number }>
  customerName?: string
  customerPhone?: string
  customerCnic?: string
  soldImeiNumbers?: string[]
  soldColors?: string[]
  purchaseFromName?: string
  purchaseFromAddress?: string
  profitAmount?: number
  purchaseCost?: number
  // expense fields
  expenseCategory?: 'Rent' | 'Utilities' | 'Salaries' | 'Marketing' | 'Transportation' | 'Supplies' | 'Taxes' | 'Custom'
  description?: string
  amount: number
  paymentMethod: PaymentMethod
  status?: 'completed' | 'pending' | 'cancelled' | 'refunded'
  invoiceNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
  deleted?: boolean
  deleteRequestedByAdmin?: boolean
}

interface TotalsSummary {
  sales: number
  expenses: number
  profit: number
}

interface LedgerState {
  transactions: LedgerTransaction[]
  loading: boolean
  // Backend API methods
  loadTransactions: () => Promise<void>
  addSale: (params: { date: string; items: Array<{ productId: string; quantity: number; unitPrice?: number }>; paymentMethod: PaymentMethod; customerName?: string; customerPhone?: string; customerCnic?: string }) => Promise<LedgerTransaction>
  addExpense: (params: { date: string; category: LedgerTransaction['expenseCategory']; description: string; amount: number; paymentMethod: PaymentMethod }) => Promise<LedgerTransaction>
  editTransaction: (id: string, updates: Partial<LedgerTransaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  getTotals: (period?: 'day' | 'week' | 'month' | 'year') => Promise<TotalsSummary>
  getTopSellers: (limit?: number) => Promise<Array<{ productId: string; name: string; quantity: number }>>
  exportExcel: () => Promise<string>
  // Local helper methods
  getLocalTotals: (range: 'day' | 'week' | 'month' | 'year', reference?: Date) => TotalsSummary
}

function startOf(date: Date, unit: 'day' | 'week' | 'month' | 'year') {
  const d = new Date(date)
  if (unit === 'day') {
    d.setHours(0, 0, 0, 0)
  } else if (unit === 'week') {
    const day = d.getDay() || 7
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (day - 1))
  } else if (unit === 'month') {
    d.setHours(0, 0, 0, 0)
    d.setDate(1)
  } else if (unit === 'year') {
    d.setHours(0, 0, 0, 0)
    d.setMonth(0, 1)
  }
  return d
}

function toCsv(values: string[]): string {
  return values
    .map((v) => {
      const s = v ?? ''
      if (s.includes(',') || s.includes('\n') || s.includes('"')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    })
    .join(',')
}

export const useLedgerStore = create<LedgerState>()(
  persist(
    (set, get) => ({
      transactions: [],
      loading: false,

      loadTransactions: async () => {
        set({ loading: true })
        try {
          const response = await api.get('/transactions')
          const transactions = (response.data?.data || []).map((t: any) => ({
            id: t._id,
            type: t.type,
            date: t.date,
            products: t.products || [],
            customerName: t.customerName,
            customerPhone: t.customerPhone,
            customerCnic: t.customerCnic,
            soldImeiNumbers: t.soldImeiNumbers,
            soldColors: t.soldColors,
            purchaseFromName: t.purchaseFromName,
            purchaseFromAddress: t.purchaseFromAddress,
            profitAmount: t.profitAmount,
            purchaseCost: t.purchaseCost,
            expenseCategory: t.expenseCategory,
            description: t.description,
            amount: t.amount,
            paymentMethod: t.paymentMethod,
            status: t.status,
            invoiceNumber: t.invoiceNumber,
            notes: t.notes,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            deleted: t.deleted,
          })) as LedgerTransaction[]
          set({ transactions })
        } catch (error) {
          console.error('Failed to load transactions:', error)
        } finally {
          set({ loading: false })
        }
      },

      addSale: async ({ date, items, paymentMethod, customerName, customerPhone, customerCnic }) => {
        try {
          const inventory = useInventoryStore.getState()
          
          const detailedItems = items.map(({ productId, quantity, unitPrice }) => {
            const product = inventory.products.find((p) => p.id === productId) as ProductItem
            const finalUnitPrice = unitPrice ?? product?.sellingPrice ?? 0
            const total = finalUnitPrice * quantity
            return { productId, name: product?.name || '', quantity, unitPrice: finalUnitPrice, total }
          })

          const amount = detailedItems.reduce((s, it) => s + it.total, 0)

          const response = await api.post('/transactions/sale', {
            date,
            products: detailedItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice
            })),
            customerName,
            customerPhone,
            customerCnic,
            amount,
            paymentMethod,
            notes: `Sale of ${detailedItems.map(p => `${p.name} x${p.quantity}`).join(', ')}`
          })

          const newTransaction = response.data?.data
          if (newTransaction) {
            const tx: LedgerTransaction = {
              id: newTransaction._id,
              type: 'sale',
              date: newTransaction.date,
              products: detailedItems,
              customerName: newTransaction.customerName,
              customerPhone: newTransaction.customerPhone,
              customerCnic: newTransaction.customerCnic,
              soldImeiNumbers: newTransaction.soldImeiNumbers,
              soldColors: newTransaction.soldColors,
              purchaseFromName: newTransaction.purchaseFromName,
              purchaseFromAddress: newTransaction.purchaseFromAddress,
              profitAmount: newTransaction.profitAmount,
              purchaseCost: newTransaction.purchaseCost,
              amount: newTransaction.amount,
              paymentMethod: newTransaction.paymentMethod,
              status: newTransaction.status,
              invoiceNumber: newTransaction.invoiceNumber,
              notes: newTransaction.notes,
              createdAt: newTransaction.createdAt,
              updatedAt: newTransaction.updatedAt,
            }
            set((state) => ({ transactions: [tx, ...state.transactions] }))
            return tx
          }
          throw new Error('Failed to create sale transaction')
        } catch (error) {
          console.error('Failed to add sale:', error)
          throw error
        }
      },

      addExpense: async ({ date, category, description, amount, paymentMethod }) => {
        try {
          const response = await api.post('/transactions/expense', {
            date,
            expenseCategory: category,
            description,
            amount,
            paymentMethod,
            notes: description
          })

          const newTransaction = response.data?.data
          if (newTransaction) {
            const tx: LedgerTransaction = {
              id: newTransaction._id,
              type: 'expense',
              date: newTransaction.date,
              expenseCategory: newTransaction.expenseCategory,
              description: newTransaction.description,
              amount: newTransaction.amount,
              paymentMethod: newTransaction.paymentMethod,
              status: newTransaction.status,
              invoiceNumber: newTransaction.invoiceNumber,
              notes: newTransaction.notes,
              createdAt: newTransaction.createdAt,
              updatedAt: newTransaction.updatedAt,
            }
            set((state) => ({ transactions: [tx, ...state.transactions] }))
            return tx
          }
          throw new Error('Failed to create expense transaction')
        } catch (error) {
          console.error('Failed to add expense:', error)
          throw error
        }
      },

      editTransaction: async (id, updates) => {
        try {
          await api.put(`/transactions/${id}`, updates)
          const now = new Date().toISOString()
          set((state) => ({
            transactions: state.transactions.map((t) => {
              if (t.id !== id) return t
              return { ...t, ...updates, updatedAt: now }
            }),
          }))
        } catch (error) {
          console.error('Failed to edit transaction:', error)
          throw error
        }
      },

      deleteTransaction: async (id) => {
        try {
          await api.delete(`/transactions/${id}`)
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
          }))
        } catch (error) {
          console.error('Failed to delete transaction:', error)
          throw error
        }
      },

      getTotals: async (period = 'month') => {
        try {
          const response = await api.get(`/transactions/totals?period=${period}`)
          return response.data?.data || { sales: 0, expenses: 0, profit: 0 }
        } catch (error) {
          console.error('Failed to get totals:', error)
          return { sales: 0, expenses: 0, profit: 0 }
        }
      },

      getTopSellers: async (limit = 5) => {
        try {
          const response = await api.get(`/transactions/top-sellers?limit=${limit}`)
          return response.data?.data || []
        } catch (error) {
          console.error('Failed to get top sellers:', error)
          return []
        }
      },

      exportExcel: async () => {
        try {
          const response = await api.get('/transactions/export/excel', { responseType: 'text' })
          return response.data
        } catch (error) {
          console.error('Failed to export transactions:', error)
          return ''
        }
      },

      // Local helper method for backward compatibility
      getLocalTotals: (range, reference) => {
        const ref = reference || new Date()
        const start = startOf(ref, range).getTime()
        const end = new Date(ref).getTime()
        const txs = get().transactions.filter((t) => {
          const time = new Date(t.date).getTime()
          return time >= start && time <= end && !t.deleted
        })
        const sales = txs.filter((t) => t.type === 'sale').reduce((s, t) => s + (t.amount || 0), 0)
        const expenses = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
        return { sales, expenses, profit: sales - expenses }
      },
    }),
    { name: 'ledger-store' }
  )
)


