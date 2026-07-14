import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMmkvStorage } from './mmkvAdapter';
import { StorageKeys } from '../keys';
import type { InvoiceItem } from '../../types';

export interface InvoiceDraftItem {
  id: string;
  productId: string | null;
  name: string;
  description: string | null;
  hsnCode: string | null;
  unit: string;
  quantity: number;
  rate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  taxType: 'inclusive' | 'exclusive' | 'exempt';
  taxAmount: number;
  amount: number;
  total: number;
}

interface InvoiceDraftState {
  customerId: string | null;
  customerName: string | null;
  items: InvoiceDraftItem[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  shippingCharges: number;
  notes: string | null;
  termsAndConditions: string | null;
  referenceNumber: string | null;
  dueDate: string | null;
  invoiceDate: string;
  shippingAddress: string | null;

  calculatedSubtotal: number;
  calculatedDiscountAmount: number;
  calculatedTaxableAmount: number;
  calculatedCgst: number;
  calculatedSgst: number;
  calculatedIgst: number;
  calculatedTotalTax: number;
  calculatedRoundOff: number;
  calculatedTotal: number;

  setCustomer: (id: string | null, name: string | null) => void;
  addItem: (item: InvoiceDraftItem) => void;
  updateItem: (id: string, updates: Partial<InvoiceDraftItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  setDiscount: (type: 'percentage' | 'fixed', value: number) => void;
  setShippingCharges: (charges: number) => void;
  setNotes: (notes: string | null) => void;
  setTermsAndConditions: (terms: string | null) => void;
  setReferenceNumber: (ref: string | null) => void;
  setDueDate: (date: string | null) => void;
  setInvoiceDate: (date: string) => void;
  setShippingAddress: (address: string | null) => void;
  recalculate: (isIgst: boolean) => void;
  reset: () => void;
}

const initialState = {
  customerId: null,
  customerName: null,
  items: [],
  discountType: 'percentage' as const,
  discountValue: 0,
  shippingCharges: 0,
  notes: null,
  termsAndConditions: null,
  referenceNumber: null,
  dueDate: null,
  invoiceDate: new Date().toISOString().split('T')[0],
  shippingAddress: null,
  calculatedSubtotal: 0,
  calculatedDiscountAmount: 0,
  calculatedTaxableAmount: 0,
  calculatedCgst: 0,
  calculatedSgst: 0,
  calculatedIgst: 0,
  calculatedTotalTax: 0,
  calculatedRoundOff: 0,
  calculatedTotal: 0,
};

function recalculateTotals(
  state: InvoiceDraftState,
  isIgst: boolean,
): Partial<InvoiceDraftState> {
  const subtotal = state.items.reduce((sum, item) => sum + item.amount, 0);

  let discountAmount = 0;
  if (state.discountType === 'percentage') {
    discountAmount = (subtotal * state.discountValue) / 100;
  } else {
    discountAmount = state.discountValue;
  }

  const taxableAmount = subtotal - discountAmount;
  const totalTax = state.items.reduce((sum, item) => sum + item.taxAmount, 0);

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isIgst) {
    igst = totalTax;
  } else {
    cgst = totalTax / 2;
    sgst = totalTax / 2;
  }

  const preRoundTotal = taxableAmount + totalTax + state.shippingCharges;
  const roundOff = Math.round(preRoundTotal) - preRoundTotal;
  const total = Math.round(preRoundTotal);

  return {
    calculatedSubtotal: subtotal,
    calculatedDiscountAmount: discountAmount,
    calculatedTaxableAmount: taxableAmount,
    calculatedCgst: cgst,
    calculatedSgst: sgst,
    calculatedIgst: igst,
    calculatedTotalTax: totalTax,
    calculatedRoundOff: roundOff,
    calculatedTotal: total,
  };
}

export const useInvoiceStore = create<InvoiceDraftState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCustomer: (id, name) => set({ customerId: id, customerName: name }),

      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearItems: () => set({ items: [] }),

      setDiscount: (type, value) => set({ discountType: type, discountValue: value }),
      setShippingCharges: (charges) => set({ shippingCharges: charges }),
      setNotes: (notes) => set({ notes }),
      setTermsAndConditions: (terms) => set({ termsAndConditions: terms }),
      setReferenceNumber: (ref) => set({ referenceNumber: ref }),
      setDueDate: (date) => set({ dueDate: date }),
      setInvoiceDate: (date) => set({ invoiceDate: date }),
      setShippingAddress: (address) => set({ shippingAddress: address }),

      recalculate: (isIgst) => {
        const state = get();
        set(recalculateTotals(state, isIgst));
      },

      reset: () => set(initialState),
    }),
    {
      name: 'invoicehub-invoice-draft',
      storage: createJSONStorage(() => createMmkvStorage(StorageKeys.INVOICE_DRAFT as any)),
      partialize: (state) => ({
        customerId: state.customerId,
        customerName: state.customerName,
        items: state.items,
        discountType: state.discountType,
        discountValue: state.discountValue,
        shippingCharges: state.shippingCharges,
        notes: state.notes,
        termsAndConditions: state.termsAndConditions,
        referenceNumber: state.referenceNumber,
        dueDate: state.dueDate,
        invoiceDate: state.invoiceDate,
        shippingAddress: state.shippingAddress,
      }),
    }
  )
);
