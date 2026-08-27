'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Hammer,
  Truck,
  Shield,
  Users2,
  Megaphone,
  Laptop,
  Tag,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  Receipt,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { BudgetTransaction, TransactionType } from './types';

interface TransactionTableProps {
  transactions: BudgetTransaction[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (tx: BudgetTransaction) => void;
  onDeleteSuccess: () => void;
  onAddNew: () => void;
  // Controlled Filter States
  search: string;
  onSearchChange: (search: string) => void;
  typeFilter: 'ALL' | TransactionType;
  onTypeFilterChange: (type: 'ALL' | TransactionType) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  personalFilter: 'false' | 'true' | 'all';
  onPersonalFilterChange: (p: 'false' | 'true' | 'all') => void;
  loading?: boolean;
}

export function TransactionTable({
  transactions,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDeleteSuccess,
  onAddNew,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  personalFilter,
  onPersonalFilterChange,
  loading = false,
}: TransactionTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/budget/transactions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDeleteSuccess();
      } else {
        alert('Failed to delete transaction');
      }
    } catch (err) {
      console.error('Error deleting transaction', err);
      alert('Error deleting transaction');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const getCategoryBadge = (category: string, type: TransactionType) => {
    const formatted = category.toUpperCase();
    switch (formatted) {
      case 'MATERIALS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/80">
            <Layers className="h-3 w-3" />
            Materials
          </span>
        );
      case 'TOOLS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/80">
            <Hammer className="h-3 w-3" />
            Tools & Gear
          </span>
        );
      case 'FUEL_VEHICLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-950/60 text-orange-300 border border-orange-800/80">
            <Truck className="h-3 w-3" />
            Fuel / Vehicle
          </span>
        );
      case 'INSURANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/80">
            <Shield className="h-3 w-3" />
            Insurance
          </span>
        );
      case 'SUBCONTRACTOR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/80">
            <Users2 className="h-3 w-3" />
            Subcontractor
          </span>
        );
      case 'MARKETING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-950/60 text-pink-300 border border-pink-800/80">
            <Megaphone className="h-3 w-3" />
            Marketing
          </span>
        );
      case 'SOFTWARE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/80">
            <Laptop className="h-3 w-3" />
            Software
          </span>
        );
      case 'REVENUE_QUOTE':
      case 'DEPOSIT':
      case 'LABOUR_INVOICE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
            <DollarSign className="h-3 w-3" />
            {formatted === 'REVENUE_QUOTE' ? 'Job Invoice' : formatted === 'DEPOSIT' ? 'Deposit' : 'Labour Fee'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-800 text-surface-300 border border-surface-700">
            <Tag className="h-3 w-3" />
            {category}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Table Controls / Filter Toolbar */}
      <div className="p-5 border-b border-surface-800 bg-surface-950/40 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search description, receipt #, vendor..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-surface-500"
            />
          </div>

          {/* Right: Actions and Add Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Business vs Personal Mode Pills */}
            <div className="flex items-center bg-surface-950 p-1 rounded-xl border border-surface-800">
              <button
                onClick={() => onPersonalFilterChange('false')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  personalFilter === 'false'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                Business Only
              </button>

              <button
                onClick={() => onPersonalFilterChange('true')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  personalFilter === 'true'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                Personal Only
              </button>

              <button
                onClick={() => onPersonalFilterChange('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  personalFilter === 'all'
                    ? 'bg-surface-800 text-white shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                All
              </button>
            </div>

            {/* Add Transaction CTA */}
            <button
              onClick={onAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-primary-950 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Secondary Filter Line (Type pills & Category select) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Income vs Expense Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onTypeFilterChange('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                typeFilter === 'ALL'
                  ? 'bg-surface-800 text-white border-surface-700'
                  : 'bg-surface-950/40 text-surface-400 border-surface-800 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => onTypeFilterChange('INCOME')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                typeFilter === 'INCOME'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-surface-950/40 text-surface-400 border-surface-800 hover:text-emerald-400'
              }`}
            >
              <ArrowUpRight className="h-3 w-3 text-emerald-400" />
              Income Only
            </button>
            <button
              onClick={() => onTypeFilterChange('EXPENSE')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                typeFilter === 'EXPENSE'
                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                  : 'bg-surface-950/40 text-surface-400 border-surface-800 hover:text-rose-400'
              }`}
            >
              <ArrowDownRight className="h-3 w-3 text-rose-400" />
              Expenses Only
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-surface-400 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="bg-surface-950 border border-surface-800 rounded-lg px-2.5 py-1 text-surface-300 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="ALL">All Categories</option>
              <option value="MATERIALS">Materials & Adhesives</option>
              <option value="TOOLS">Tools & Equipment</option>
              <option value="FUEL_VEHICLE">Fuel & Vehicle</option>
              <option value="INSURANCE">Insurance</option>
              <option value="SUBCONTRACTOR">Subcontractor</option>
              <option value="MARKETING">Marketing</option>
              <option value="SOFTWARE">Software</option>
              <option value="REVENUE_QUOTE">Job Invoices</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-950/60 border-b border-surface-800 text-[11px] font-bold text-surface-400 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">Date</th>
              <th className="py-3.5 px-4">Description / Reference</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Linked Job / Quote</th>
              <th className="py-3.5 px-4 text-right">GST (10%)</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Amount (Inc GST)</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-surface-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading ledger transactions...</span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="p-3 bg-surface-800/80 border border-surface-700 text-surface-400 rounded-2xl w-fit mx-auto">
                      <Receipt className="h-6 w-6" />
                    </div>
                    <p className="text-base font-bold text-white">No transactions found</p>
                    <p className="text-xs text-surface-400">
                      {search || categoryFilter !== 'ALL' || typeFilter !== 'ALL'
                        ? 'No records match your active filters. Try resetting search filters.'
                        : 'Your ledger is currently empty. Record your first income or expense.'}
                    </p>
                    <button
                      onClick={onAddNew}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add First Transaction
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                const isPersonal = tx.isPersonal;

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-surface-800/30 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-xs text-surface-400 font-mono">
                      {formatDate(tx.date)}
                    </td>

                    {/* Description & Reference */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="flex items-start gap-2">
                        <div>
                          <p className="font-semibold text-white text-sm line-clamp-1">
                            {tx.description}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-surface-400">
                            {tx.reference && (
                              <span className="font-mono text-[11px] bg-surface-950 px-1.5 py-0.5 rounded border border-surface-800">
                                Ref: {tx.reference}
                              </span>
                            )}
                            {tx.paymentMethod && (
                              <span className="text-[11px] text-surface-500">
                                {tx.paymentMethod.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Personal Flag Badge */}
                        {isPersonal && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-purple-950 text-purple-300 border border-purple-800 shrink-0">
                            Personal
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getCategoryBadge(tx.category, tx.type)}
                    </td>

                    {/* Linked Job / Quote */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                      {tx.quote ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-950 text-surface-300 border border-surface-800 font-mono text-[11px]">
                          <FileCheck className="h-3 w-3 text-primary-400" />
                          {tx.quote.quoteNumber} ({tx.quote.customerName.split(' ')[0]})
                        </span>
                      ) : (
                        <span className="text-surface-600 text-xs">—</span>
                      )}
                    </td>

                    {/* GST Component */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right text-xs font-mono text-amber-400/90">
                      ${tx.gstAmount.toFixed(2)}
                    </td>

                    {/* Amount (+Green / -Red) */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right font-mono font-bold">
                      <span
                        className={`text-sm sm:text-base ${
                          isIncome
                            ? 'text-emerald-400'
                            : isPersonal
                            ? 'text-purple-300'
                            : 'text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'} $
                        {tx.amount.toLocaleString('en-AU', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1.5 text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition-all cursor-pointer"
                          title="Edit transaction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {confirmDeleteId === tx.id ? (
                          <div className="flex items-center gap-1 bg-red-950/80 p-1 rounded-lg border border-red-800">
                            <button
                              onClick={() => handleDelete(tx.id)}
                              disabled={deletingId === tx.id}
                              className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              {deletingId === tx.id ? '...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 text-surface-400 hover:text-white text-[10px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(tx.id)}
                            className="p-1.5 text-surface-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-all cursor-pointer"
                            title="Delete transaction"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-surface-800 bg-surface-950/40 flex items-center justify-between text-xs text-surface-400">
          <div>
            Showing <span className="text-white font-medium">{transactions.length}</span> of{' '}
            <span className="text-white font-medium">{totalCount}</span> transactions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-surface-800 hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-surface-800 hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
