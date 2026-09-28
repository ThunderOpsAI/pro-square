'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Calendar,
  Tag,
  Building2,
  Receipt,
  Layers,
  Hammer,
  Truck,
  Shield,
  Users2,
  Megaphone,
  Laptop,
  Percent,
  ChevronRight,
  ArrowLeft,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ExpenseCategory,
  LinkedQuoteInfo,
} from './types';
import { ScannedReceiptResult } from '@/lib/receipt-scanner';

interface ReceiptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export function ReceiptUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: ReceiptUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [scanResult, setScanResult] = useState<ScannedReceiptResult | null>(null);

  // Editable Form fields populated after scan
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [gstAmount, setGstAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('MATERIALS');
  const [reference, setReference] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('EFTPOS');
  const [isTaxDeductible, setIsTaxDeductible] = useState<boolean>(true);
  const [quoteId, setQuoteId] = useState<string>('');

  // Quotes for linking
  const [availableQuotes, setAvailableQuotes] = useState<LinkedQuoteInfo[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load quotes for optional project linking
  useEffect(() => {
    if (!isOpen) return;
    const fetchQuotes = async () => {
      try {
        const res = await fetch('/api/admin/quotes?status=WON,QUOTED,INVOICED,PAID&limit=100');
        if (res.ok) {
          const data = await res.json();
          const list = (data.quotes || []).map((q: any) => ({
            id: q.id,
            quoteNumber: q.quoteNumber,
            customerName: q.customerName,
            projectType: q.projectType,
            totalIncGst: q.totalIncGst,
            materialCost: q.materialCost,
          }));
          setAvailableQuotes(list);
        }
      } catch (err) {
        console.error('Failed to load quotes for linking', err);
      }
    };
    fetchQuotes();
  }, [isOpen]);

  // Clean reset when opening / closing
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setFilePreview(null);
      setScanResult(null);
      setError('');
      setScanning(false);
      setSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setError('');
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    const isImage = selectedFile.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(selectedFile.name);

    if (!isPdf && !isImage) {
      setError('Please upload a PDF invoice or an image (PNG, JPG, WEBP).');
      return;
    }

    if (selectedFile.size > 12 * 1024 * 1024) {
      setError('File size must be under 12MB.');
      return;
    }

    setFile(selectedFile);

    if (isImage) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }

    // Auto-trigger scanning on file drop
    scanFileWithAi(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const scanFileWithAi = async (fileToScan: File) => {
    setScanning(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', fileToScan);

      const res = await fetch('/api/admin/budget/scan-receipt', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to extract receipt data');
      }

      const data: ScannedReceiptResult = json.data;
      setScanResult(data);

      // Populate form
      setDescription(data.description || `${data.merchantName} Receipt`);
      setAmount(data.totalAmount ? data.totalAmount.toFixed(2) : '');
      setGstAmount(data.gstAmount ? data.gstAmount.toFixed(2) : '');
      setDate(data.date || new Date().toISOString().split('T')[0]);
      setCategory(data.category || 'MATERIALS');
      setReference(data.invoiceNumber || '');
      setPaymentMethod(data.paymentMethod || 'EFTPOS');
      setIsTaxDeductible(data.isTaxDeductible !== false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error processing document with Gemini AI');
    } finally {
      setScanning(false);
    }
  };

  const handleSaveToLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please provide a valid expense amount.');
      return;
    }

    const parsedGst = parseFloat(gstAmount) || 0;

    setSaving(true);
    try {
      const payload = {
        type: 'EXPENSE',
        category,
        amount: parsedAmount,
        gstAmount: parsedGst,
        isTaxDeductible,
        description: description.trim(),
        date: new Date(date).toISOString(),
        reference: reference.trim() || undefined,
        paymentMethod,
        isPersonal: false,
        quoteId: quoteId || undefined,
      };

      const res = await fetch('/api/admin/budget/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save transaction');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving transaction to ledger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface-900 border border-surface-700/80 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-surface-800 flex items-center justify-between bg-surface-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-600/30 border border-primary-500/40 text-primary-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>AI Receipt &amp; Bill Ingestion</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-primary-950 text-primary-400 border border-primary-800/80 px-2 py-0.5 rounded-full">
                  Gemini OCR
                </span>
              </h3>
              <p className="text-xs text-surface-400">
                Drop Bunnings, trade supplier invoices or photos to auto-populate your ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-200 text-xs flex items-center gap-3">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Upload / Dropzone (Shown when no scan result yet) */}
          {!scanResult && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-primary-500 bg-primary-950/20'
                  : 'border-surface-700 hover:border-surface-500 bg-surface-950/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {scanning ? (
                <div className="space-y-4 py-4">
                  <div className="w-16 h-16 rounded-3xl bg-primary-500/20 border border-primary-500/40 text-primary-400 flex items-center justify-center mx-auto animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Scanning Document with Gemini AI...</h4>
                    <p className="text-xs text-surface-400 mt-1 max-w-sm mx-auto">
                      Extracting merchant, item descriptions, line items, date, GST &amp; total amount in AUD.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-surface-800 border border-surface-700 text-primary-400 flex items-center justify-center mx-auto shadow-inner">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Drag &amp; drop invoice or receipt here
                    </h4>
                    <p className="text-xs text-surface-400 mt-1">
                      Supports PDF invoices, or camera snaps (PNG, JPG, WEBP) up to 12MB
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 border border-surface-600 rounded-xl text-xs font-semibold shadow-sm transition-all">
                      <FileText className="h-3.5 w-3.5 text-primary-400" />
                      Browse Files
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Scanned Result Review & Save Form */}
          {scanResult && (
            <form onSubmit={handleSaveToLedger} className="space-y-5 animate-in fade-in duration-300">
              
              {/* Extraction Confidence Badge & Back Button */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-300">
                      Successfully Extracted: {scanResult.merchantName}
                    </span>
                    {scanResult.confidenceNotes && (
                      <p className="text-[11px] text-surface-400 line-clamp-1">
                        {scanResult.confidenceNotes}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setScanResult(null);
                    setFile(null);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-surface-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Scan Another
                </button>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Description / Merchant */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">
                    Description / Merchant <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950/80 border border-surface-700 text-white text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Bunnings - 4x Davco SMP Evo adhesive"
                  />
                </div>

                {/* Amount Total */}
                <div>
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">
                    Total Amount ($ AUD) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAmount(val);
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          setGstAmount((num / 11).toFixed(2));
                        }
                      }}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-surface-950/80 border border-surface-700 text-white text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-semibold text-emerald-400 transition-all"
                    />
                  </div>
                </div>

                {/* GST Amount */}
                <div>
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">
                    GST Included ($ AUD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={gstAmount}
                      onChange={(e) => setGstAmount(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-surface-950/80 border border-surface-700 text-white text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">
                    Ledger Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950/80 border border-surface-700 text-white text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-surface-900 text-white">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950/80 border border-surface-700 text-white text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Invoice / Reference Number */}
                <div>
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">
                    Receipt / Tax Invoice #
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. INV-90412"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950/80 border border-surface-700 text-white text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Link to Job / Quote */}
                <div>
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">
                    Link to Job Quote (Optional)
                  </label>
                  <select
                    value={quoteId}
                    onChange={(e) => setQuoteId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950/80 border border-surface-700 text-white text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="" className="bg-surface-900 text-surface-400">
                      -- General Business Expense (No Job) --
                    </option>
                    {availableQuotes.map((q) => (
                      <option key={q.id} value={q.id} className="bg-surface-900 text-white">
                        {q.quoteNumber} - {q.customerName} ({q.projectType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tax Deductible Switch */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-950/50 border border-surface-800">
                <div>
                  <span className="text-xs font-bold text-white block">100% Tax Deductible Trade Expense</span>
                  <span className="text-[11px] text-surface-400">Included in tax reserve offsets for annual ATO return</span>
                </div>
                <input
                  type="checkbox"
                  checked={isTaxDeductible}
                  onChange={(e) => setIsTaxDeductible(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 bg-surface-900 border-surface-700 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-800">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-surface-300 hover:text-white hover:bg-surface-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-950 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving to Ledger...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Add to Ledger</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
