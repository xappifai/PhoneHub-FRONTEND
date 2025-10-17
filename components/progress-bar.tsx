"use client"

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: string[]
  className?: string
}

export default function ProgressBar({ 
  currentStep, 
  totalSteps, 
  steps, 
  className 
}: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={stepNumber} className="flex items-center">
              {/* Step Circle */}
              <div className="flex items-center justify-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isCompleted && "bg-primary border-primary text-white",
                    isCurrent && "bg-primary border-primary text-white",
                    isUpcoming && "bg-white border-gray-300 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </div>
              </div>

              {/* Step Label */}
              <div className="ml-3">
                <p
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isCompleted && "text-primary",
                    isCurrent && "text-primary",
                    isUpcoming && "text-gray-500"
                  )}
                >
                  {step}
                </p>
              </div>

              {/* Connector Line */}
              {stepNumber < totalSteps && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    isCompleted ? "bg-primary" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Percentage */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
