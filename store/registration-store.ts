import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BuyerFormData {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

export interface SellerFormData {
  // Step 1: Basic Info
  firstName: string
  lastName: string
  email: string
  phone: string
  
  // Step 2: Address
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  
  // Step 3: Business & Security
  businessName: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

interface RegistrationStore {
  // Current step for seller wizard
  currentStep: number
  setCurrentStep: (step: number) => void
  
  // Form data
  buyerFormData: BuyerFormData
  sellerFormData: SellerFormData
  
  // Actions
  updateBuyerFormData: (data: Partial<BuyerFormData>) => void
  updateSellerFormData: (data: Partial<SellerFormData>) => void
  resetBuyerForm: () => void
  resetSellerForm: () => void
  resetAllForms: () => void
}

const initialBuyerFormData: BuyerFormData = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
}

const initialSellerFormData: SellerFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Pakistan',
  businessName: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
}

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      setCurrentStep: (step) => set({ currentStep: step }),
      
      buyerFormData: initialBuyerFormData,
      sellerFormData: initialSellerFormData,
      
      updateBuyerFormData: (data) =>
        set((state) => ({
          buyerFormData: { ...state.buyerFormData, ...data }
        })),
      
      updateSellerFormData: (data) =>
        set((state) => ({
          sellerFormData: { ...state.sellerFormData, ...data }
        })),
      
      resetBuyerForm: () => set({ buyerFormData: initialBuyerFormData }),
      resetSellerForm: () => set({ 
        sellerFormData: initialSellerFormData,
        currentStep: 1
      }),
      resetAllForms: () => set({
        buyerFormData: initialBuyerFormData,
        sellerFormData: initialSellerFormData,
        currentStep: 1
      })
    }),
    {
      name: 'registration-store',
      partialize: (state) => ({
        buyerFormData: state.buyerFormData,
        sellerFormData: state.sellerFormData,
        currentStep: state.currentStep
      })
    }
  )
)
