"use client"

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl mx-4">
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800', className)}>
      {children}
    </div>
  )
}

export function DialogTitle({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-xl font-semibold', className)}>{children}</h2>
}

export function DialogClose({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
      <X className="h-5 w-5" />
    </button>
  )
}

export function DialogContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 max-h-[80vh] overflow-y-auto', className)}>{children}</div>
}

export function DialogFooter({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2', className)}>{children}</div>
}


