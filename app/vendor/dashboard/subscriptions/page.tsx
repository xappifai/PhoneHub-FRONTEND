"use client"

import React from 'react'
import ProtectedRoute from '@/components/protected-route'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSubscriptionStore, PlanName } from '@/store/subscription-store'

const PLANS: { name: PlanName; price: number; features: string[] }[] = [
  { name: 'Free', price: 0, features: ['50 products', '100 transactions/mo', 'Basic storefront', 'Basic theme'] },
  { name: 'Basic', price: 2500, features: ['200 products', '500 transactions/mo', 'Custom themes', 'Priority support'] },
  { name: 'Pro', price: 5000, features: ['1000 products', 'Unlimited transactions', 'Custom domain', 'Advanced analytics'] },
  { name: 'Premium', price: 10000, features: ['Unlimited products', 'Unlimited transactions', 'API access', 'White-label'] },
]

function formatPKR(n: number) { return n === 0 ? 'Free' : `Rs ${n.toLocaleString()}/mo` }

export default function SubscriptionsPage() {
  const { plan, cycle, autoRenew, setPlan, setCycle, toggleAutoRenew } = useSubscriptionStore()
  const isAnnual = cycle === 'annual'

  const priceWithCycle = (p: number) => {
    if (p === 0) return 0
    const monthly = p
    return isAnnual ? Math.round(monthly * 12 * 0.8) : monthly
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar userRole="vendor" />
        <div className="flex-1 lg:ml-64 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
            <p className="text-gray-600 dark:text-gray-400">Choose a plan that suits your business. Annual billing saves 20%.</p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className={`px-2 py-1 rounded text-xs ${cycle==='monthly'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-700'}`}>Monthly</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only" checked={isAnnual} onChange={(e)=> setCycle(e.target.checked ? 'annual' : 'monthly')} />
              <div className="w-12 h-6 bg-gray-300 rounded-full p-1 flex items-center transition">
                <div className={`h-4 w-4 bg-white rounded-full shadow transform transition ${isAnnual ? 'translate-x-6' : ''}`} />
              </div>
            </label>
            <span className={`px-2 py-1 rounded text-xs ${cycle==='annual'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>Annual (Save 20%)</span>
          </div>

          {/* Plan cards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {PLANS.map(p => (
              <Card key={p.name} className={`border-2 ${plan===p.name?'border-blue-500':'border-gray-200 dark:border-gray-700'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{p.name}</span>
                    {p.name==='Pro' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Popular</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold">{formatPKR(priceWithCycle(p.price))}{isAnnual && p.price>0 && <span className="text-xs text-gray-500"> /{cycle}</span>}</div>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    {p.features.map(f => <li key={f}>{f}</li>)}
                  </ul>
                  <Button onClick={()=> setPlan(p.name, true)} className="w-full">{plan===p.name?'Current Plan':'Choose ' + p.name}</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison table */}
          <div className="mt-10">
            <Card>
              <CardHeader><CardTitle>Feature Comparison</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-3">Feature</th>
                      {PLANS.map(p=> <th key={p.name} className="p-3 text-left">{p.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Max Products','50','200','1000','Unlimited'],
                      ['Transactions / month','100','500','Unlimited','Unlimited'],
                      ['Custom Domain','-','-','Yes','Yes'],
                      ['Custom Themes','-','Yes','Yes','Yes'],
                      ['Advanced Analytics','-','-','Yes','Yes'],
                      ['API Access','-','-','-','Yes'],
                      ['White-label','-','-','-','Yes'],
                    ].map((row)=> (
                      <tr key={row[0]} className="border-t">
                        {row.map((cell,i)=> <td key={i} className="p-3">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Billing & Auto renew */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Auto-Renewal</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto renew subscription</div>
                  <div className="text-sm text-gray-500">We will renew at the end of each cycle.</div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only" checked={autoRenew} onChange={(e)=> toggleAutoRenew(e.target.checked)} />
                  <div className="w-12 h-6 bg-gray-300 rounded-full p-1 flex items-center transition">
                    <div className={`h-4 w-4 bg-white rounded-full shadow transform transition ${autoRenew ? 'translate-x-6' : ''}`} />
                  </div>
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-gray-600">Mock integrations for MVP:</div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline">Pay with JazzCash</Button>
                  <Button variant="outline">Pay with Easypaisa</Button>
                  <Button variant="outline">Pay with Stripe</Button>
                  <Button variant="outline">Pay with PayPal</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}


