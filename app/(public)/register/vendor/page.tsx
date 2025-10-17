"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VendorRegistrationIndex() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the first step of vendor registration
    router.replace('/register/vendor/step1')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to vendor registration...</p>
      </div>
    </div>
  )
}
