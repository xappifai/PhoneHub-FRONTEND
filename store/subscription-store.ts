import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PlanName = 'Free' | 'Basic' | 'Pro' | 'Premium'
export type BillingCycle = 'monthly' | 'annual'

export interface Invoice {
  id: string
  plan: PlanName
  amount: number
  cycle: BillingCycle
  date: string
  status: 'paid' | 'failed' | 'refunded'
}

export interface SubscriptionState {
  plan: PlanName
  cycle: BillingCycle
  autoRenew: boolean
  expiresAt: string
  graceUntil?: string
  invoices: Invoice[]
  limits: { maxProducts: number | -1; maxTransactionsPerMonth: number | -1; customDomain: boolean; themes: boolean; analytics: boolean; apiAccess: boolean; whiteLabel: boolean }
  setPlan: (plan: PlanName, immediate?: boolean) => void
  setCycle: (cycle: BillingCycle) => void
  toggleAutoRenew: (value: boolean) => void
  addInvoice: (invoice: Invoice) => void
}

const PLAN_LIMITS: Record<PlanName, SubscriptionState['limits']> = {
  Free: { maxProducts: 50, maxTransactionsPerMonth: 100, customDomain: false, themes: false, analytics: false, apiAccess: false, whiteLabel: false },
  Basic: { maxProducts: 200, maxTransactionsPerMonth: 500, customDomain: false, themes: true, analytics: false, apiAccess: false, whiteLabel: false },
  Pro: { maxProducts: 1000, maxTransactionsPerMonth: -1, customDomain: true, themes: true, analytics: true, apiAccess: false, whiteLabel: false },
  Premium: { maxProducts: -1, maxTransactionsPerMonth: -1, customDomain: true, themes: true, analytics: true, apiAccess: true, whiteLabel: true },
}

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      plan: 'Free',
      cycle: 'monthly',
      autoRenew: true,
      expiresAt: addMonths(new Date(), 1).toISOString(),
      invoices: [],
      limits: PLAN_LIMITS['Free'],

      setPlan: (plan, immediate = true) => {
        const now = new Date()
        const months = get().cycle === 'monthly' ? 1 : 12
        const expiresAt = immediate ? addMonths(now, months).toISOString() : get().expiresAt
        set({ plan, limits: PLAN_LIMITS[plan], expiresAt })
      },
      setCycle: (cycle) => set({ cycle }),
      toggleAutoRenew: (value) => set({ autoRenew: value }),
      addInvoice: (invoice) => set((s) => ({ invoices: [invoice, ...s.invoices] })),
    }),
    { name: 'subscription-store' }
  )
)




