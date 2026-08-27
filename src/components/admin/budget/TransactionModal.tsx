'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Edit3,
  DollarSign,
  Calendar,
  FileText,
  CreditCard,
  Building2,
  User,
  Check,
  AlertCircle,
  Tag,
  Hammer,
  Truck,
  Shield,
  Users2,
  Megaphone,
  Laptop,
  Layers,
  Percent,
} from 'lucide-react';
import {
  TransactionType,
  ExpenseCategory,
  IncomeCategory,
  BudgetTransaction,
  LinkedQuoteInfo,
} from './types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: BudgetTransaction | null;
}

const EXPENSE_CATEGORIES: Array<{ value: ExpenseCategory; label: string; icon: React.ElementType }> = [
  { value: 'MATERIALS', label: 'Materials & Adhesives', icon: Layers },
  { value: 'TOOLS', label: 'Tools & Equipment', icon: Hammer },
  { value: 'FUEL_VEHICLE', label: 'Fuel & Van / Vehicle', icon: Truck },
  { value: 'INSURANCE', label: 'Public Liability & Insurance', icon: Shield },
  { value: 'SUBCONTRACTOR', label: 'Subcontractors / Labour', icon: Users2 },
  { value: 'MARKETING', label: 'Marketing & Advertising', icon: Megaphone },
  { value: 'SOFTWARE', label: 'Software & Subscriptions', icon: Laptop },
  { value: 'GENERAL', label: 'General Overhead', icon: Tag },
];

const INCOME_CATEGORIES: Array<{ value: IncomeCategory; label: string; icon: React.ElementType }> = [
  { value: 'REVENUE_QUOTE', label: 'Job Invoice / Milestone', icon: DollarSign },
  { value: 'DEPOSIT', label: 'Job Deposit', icon: DollarSign },
  { value: 'LABOUR_INVOICE', label: 'Day Rate / Labour', icon: Hammer },
  { value: 'GENERAL', label: 'Other Income', icon: Tag },
];

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer (EFT)' },
  { value: 'CREDIT_CARD', label: 'Business Credit Card' },
  { value: 'EFTPOS', label: 'EFTPOS / Debit Card' },
  { value: 'CASH', label: 'Cash Payment' },
  { value: 'DIRECT_DEBIT', label: 'Direct Debit' },
];

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  transactionToEdit,
}: TransactionModalProps) {
  const isEditing = Boolean(transactionToEdit);

  // Form State
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState<string>('MATERIALS');
  const [amount, setAmount] = useState<string>('');
  const [autoGst, setAutoGst] = useState<boolean>(true);
  const [customGst, setCustomGst] = useState<string>('');
  const [isTaxDeductible, setIsTaxDeductible] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('BANK_TRANSFER');
  const [isPersonal, setIsPersonal] = useState<boolean>(false);
  const [quoteId, setQuoteId] = useState<string>('');

  // Available Quotes for Linking
  const [availableQuotes, setAvailableQuotes] = useState<LinkedQuoteInfo[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState<boolean>(false);

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch Quotes for linking dropdown
  useEffect(() => {
    if (!isOpen) return;

    const fetchQuotes = async () => {
      setLoadingQuotes(true);
      try {
        const res = await fetch('/api/admin/quotes?limit=30');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.quotes)) {
            setAvailableQuotes(
              data.quotes.map((q: { id: string; quoteNumber: string; customerName: string; projectType: string; totalIncGst?: number }) => ({
                id: q.id,
                quoteNumber: q.quoteNumber,
                customerName: q.customerName,
                projectType: q.projectType,
                totalIncGst: q.totalIncGst,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load quotes for transaction selector', err);
      } finally {
        setLoadingQuotes(false);
      }
    };

    fetchQuotes();
  }, [isOpen]);

  // Populate form if editing
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setAmount(transactionToEdit.amount.toString());
      setDescription(transactionToEdit.description);
      setDate(transactionToEdit.date ? transactionToEdit.date.split('T')[0] : new Date().toISOString().split('T')[0]);
      setReference(transactionToEdit.reference || '');
      setPaymentMethod(transactionToEdit.paymentMethod || 'BANK_TRANSFER');
      setIsPersonal(transactionToEdit.isPersonal);
      setIsTaxDeductible(transactionToEdit.isTaxDeductible);
      setQuoteId(transactionToEdit.quoteId || '');

      // Check if GST is exactly 1/11th
      const expectedGst = Math.round((transactionToEdit.amount / 11) * 100) / 100;
      if (Math.abs(expectedGst - transactionToEdit.gstAmount) < 0.05) {
        setAutoGst(true);
        setCustomGst('');
      } else {
        setAutoGst(false);
        setCustomGst(transactionToEdit.gstAmount.toString());
      }
    } else {
      // Reset form defaults for new entry
      setType('EXPENSE');
      setCategory('MATERIALS');
      setAmount('');
      setAutoGst(true);
      setCustomGst('');
      setIsTaxDeductible(true);
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setReference('');
      setPaymentMethod('BANK_TRANSFER');
      setIsPersonal(false);
      setQuoteId('');
      setError('');
    }
  }, [transactionToEdit, isOpen]);

  // When type changes, adjust default category and tax deductible status
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'INCOME') {
      setCategory('REVENUE_QUOTE');
      setIsTaxDeductible(false);
    } else {
      setCategory('MATERIALS');
      setIsTaxDeductible(!isPersonal);
    }
  };

  // When isPersonal changes
  const handlePersonalToggle = (personal: boolean) => {
    setIsPersonal(personal);
    if (personal) {
      setIsTaxDeductible(false);
      setAutoGst(false);
      setCustomGst('0');
    } else {
      setIsTaxDeductible(type === 'EXPENSE');
      setAutoGst(true);
      setCustomGst('');
    }
  };

  // Calculate GST preview
  const numAmount = parseFloat(amount) || 0;
  const computedGst = isPersonal
    ? 0
    : autoGst
    ? Math.round((numAmount / 11) * 100) / 100
    : parseFloat(customGst) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount greater than $0.00');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a short description or vendor name');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        type,
        category: category.toUpperCase(),
        amount: numAmount,
        gstAmount: computedGst,
        isTaxDeductible,
        description: description.trim(),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        reference: reference.trim() || undefined,
        paymentMethod,
        isPersonal,
        quoteId: quoteId || undefined,
      };

      const url = isEditing && transactionToEdit
        ? `/api/admin/budget/transactions/${transactionToEdit.id}`
        : '/api/admin/budget/transactions';

      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save transaction');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while saving';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800 bg-surface-950/60">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border shadow-sm ${
                type === 'INCOME'
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                  : 'bg-rose-950/60 border-rose-800/60 text-rose-400'
              }`}
            >
              {isEditing ? <Edit3 className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEditing ? 'Edit Transaction' : 'Record Transaction'}
              </h2>
              <p className="text-xs text-surface-400">
                Keep your trade ledger and tax records accurate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Type Selection (Income vs Expense) */}
          <div>
            <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">
              Transaction Flow
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('INCOME')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  type === 'INCOME'
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600 shadow-md shadow-emerald-950/50'
                    : 'bg-surface-950/50 text-surface-400 border-surface-800 hover:border-surface-700 hover:text-surface-200'
                }`}
              >
                <DollarSign className="h-4 w-4 text-emerald-400" />
                Income / Client Payment (+)
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('EXPENSE')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  type === 'EXPENSE'
                    ? 'bg-rose-950/70 text-rose-300 border-rose-600 shadow-md shadow-rose-950/50'
                    : 'bg-surface-950/50 text-surface-400 border-surface-800 hover:border-surface-700 hover:text-surface-200'
                }`}
              >
                <DollarSign className="h-4 w-4 text-rose-400" />
                Expense / Purchase (-)
              </button>
            </div>
          </div>

          {/* Row 2: Account Purpose (Business vs Personal Separation) */}
          <div className="p-3.5 bg-surface-950/60 border border-surface-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-lg border ${
                    isPersonal
                      ? 'bg-purple-950/50 border-purple-800 text-purple-400'
                      : 'bg-primary-950/50 border-primary-800 text-primary-400'
                  }`}
                >
                  {isPersonal ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isPersonal ? 'Personal Expense / Drawing' : 'Strictly Business Transaction'}
                  </span>
                  <span className="text-[11px] text-surface-400">
                    {isPersonal
                      ? 'Isolated from business profit & ATO tax deductions'
                      : 'Counts towards business P&L and BAS claim credits'}
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-1.5 bg-surface-900 p-1 rounded-lg border border-surface-800">
                <button
                  type="button"
                  onClick={() => handlePersonalToggle(false)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    !isPersonal
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-surface-400 hover:text-white'
                  }`}
                >
                  Business
                </button>
                <button
                  type="button"
                  onClick={() => handlePersonalToggle(true)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isPersonal
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-surface-400 hover:text-white'
                  }`}
                >
                  Personal
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Amount ($ Inc GST) & GST Vault Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">
                Total Amount ($ AUD) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 font-bold font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono text-base focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-surface-600"
                />
              </div>
            </div>

            {/* GST Component */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-surface-300 uppercase tracking-wider">
                  GST Component (10%)
                </label>
                {!isPersonal && (
                  <button
                    type="button"
                    onClick={() => setAutoGst(!autoGst)}
                    className="text-[11px] text-primary-400 hover:text-primary-300 font-medium cursor-pointer"
                  >
                    {autoGst ? 'Customize GST' : 'Reset Auto 10%'}
                  </button>
                )}
              </div>

              {autoGst || isPersonal ? (
                <div className="bg-surface-950/60 border border-surface-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm font-mono">
                  <span className="text-surface-400 text-xs font-sans">
                    {isPersonal ? 'GST Excluded (Personal)' : 'Auto 1/11th GST:'}
                  </span>
                  <span className="font-bold text-amber-400">
                    ${computedGst.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 font-bold font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={customGst}
                    onChange={(e) => setCustomGst(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-8 pr-4 py-2.5 text-amber-300 font-mono text-base focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-surface-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Category Selection & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              >
                {type === 'EXPENSE' ? (
                  EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))
                ) : (
                  INCOME_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">
                Transaction Date <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Description & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">
                Description / Vendor <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bunnings - Waterproofing Membrane"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-surface-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">
                Receipt # / Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. REC-89201 or INV-004"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-surface-600"
              />
            </div>
          </div>

          {/* Row 6: Payment Method & Link to Quote */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Link to Quote */}
            <div>
              <label className="block text-xs font-semibold text-surface-300 uppercase tracking-wider mb-1.5">
                Link to Job / Quote (Optional)
              </label>
              <select
                value={quoteId}
                onChange={(e) => setQuoteId(e.target.value)}
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
              >
                <option value="">-- Unlinked / General Overhead --</option>
                {availableQuotes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.quoteNumber} - {q.customerName} ({q.projectType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-surface-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-surface-400 hover:text-white hover:bg-surface-800 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                type === 'INCOME'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                  : 'bg-primary-600 hover:bg-primary-500 shadow-primary-900/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{isEditing ? 'Update Transaction' : 'Save Transaction'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
