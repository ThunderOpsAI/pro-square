'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Eye,
  Shield,
  CreditCard,
  Building,
  Sparkles,
} from 'lucide-react';

interface ProposalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteId: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  projectAddress?: string | null;
  projectType: string;
  scopeDescription?: string | null;
  areaM2?: number;
  subtotalExGst: number;
  gstAmount?: number;
  totalIncGst: number;
  proposalText?: string | null;
  tileLengthMm?: number | null;
  tileWidthMm?: number | null;
  tileThicknessMm?: number | null;
  groutJointMm?: number | null;
  isWetArea?: boolean;
  onSendSuccess?: () => void;
}

export function ProposalPreviewModal({
  isOpen,
  onClose,
  quoteId,
  quoteNumber,
  customerName,
  customerEmail,
  customerPhone,
  projectAddress,
  projectType,
  scopeDescription,
  areaM2 = 0,
  subtotalExGst,
  gstAmount = Math.round(subtotalExGst * 0.1),
  totalIncGst,
  proposalText,
  tileLengthMm = 600,
  tileWidthMm = 600,
  tileThicknessMm = 10,
  groutJointMm = 2,
  isWetArea = false,
  onSendSuccess,
}: ProposalPreviewModalProps) {
  const [recipientEmail, setRecipientEmail] = useState(customerEmail);
  const [emailSubject, setEmailSubject] = useState(
    `Trade Proposal ${quoteNumber}: ${projectType} Installation | Pro Square Tiling`
  );
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw'>('formatted');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync recipient if prop changes
  React.useEffect(() => {
    setRecipientEmail(customerEmail);
    setEmailSubject(
      `Trade Proposal ${quoteNumber}: ${projectType} Installation | Pro Square Tiling`
    );
  }, [customerEmail, quoteNumber, projectType]);

  if (!isOpen) return null;

  const handleCopyText = () => {
    if (proposalText) {
      navigator.clipboard.writeText(proposalText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setSendError('Please provide a valid recipient email address.');
      return;
    }

    setIsSending(true);
    setSendError('');

    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOverride: recipientEmail,
          subject: emailSubject,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch proposal email');
      }

      setSendSuccess(true);
      if (onSendSuccess) {
        onSendSuccess();
      }

      setTimeout(() => {
        setSendSuccess(false);
        onClose();
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error sending email';
      setSendError(message);
    } finally {
      setIsSending(false);
    }
  };

  // Milestone payment calculations
  const deposit10 = Math.round(totalIncGst * 0.1);
  const progress40 = Math.round(totalIncGst * 0.4);
  const final50 = totalIncGst - deposit10 - progress40;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-900 border border-surface-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-surface-800 bg-surface-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-600/20 border border-primary-500/30 rounded-xl text-primary-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-primary-400">
                  Client Proposal Dispatch
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-800 text-surface-300">
                  {quoteNumber}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Send Proposal to {customerName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-surface-400 hover:text-white rounded-full bg-surface-800/60 hover:bg-surface-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Email Metadata Controls */}
        <div className="px-6 py-4 bg-surface-950/40 border-b border-surface-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-surface-400 font-semibold mb-1">
              Recipient Email Address:
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full px-3 py-2 bg-surface-950 border border-surface-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-surface-400 font-semibold mb-1">
              Email Subject Line:
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2 bg-surface-950 border border-surface-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Tab Selector & Actions */}
        <div className="px-6 py-2.5 bg-surface-900 border-b border-surface-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('formatted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'formatted'
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-800/50 text-surface-400 hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Interactive Preview
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'raw'
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-800/50 text-surface-400 hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Plain Text / Scope
            </button>
          </div>

          {proposalText && (
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 rounded-lg text-xs text-surface-300 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Scrollable Preview Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {sendError && (
            <div className="p-4 bg-red-950/50 border border-red-800 rounded-2xl flex items-center gap-3 text-red-300 text-xs">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <span>{sendError}</span>
            </div>
          )}

          {sendSuccess && (
            <div className="p-4 bg-emerald-950/50 border border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Proposal sent successfully via Resend to {recipientEmail}!</span>
            </div>
          )}

          {activeTab === 'formatted' ? (
            <div className="bg-surface-950 rounded-2xl border border-surface-800 p-6 space-y-6 text-sm text-surface-200">
              {/* Proposal Header Banner */}
              <div className="border-b border-surface-800 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary-400" />
                    Pro Square Tiling
                  </div>
                  <div className="text-xs text-surface-400 mt-0.5">
                    Master Craftsmanship &bull; NSW Lic. #394821C
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs text-surface-400 uppercase font-semibold">
                    Proposal Reference
                  </div>
                  <div className="font-mono text-base font-bold text-primary-400">{quoteNumber}</div>
                  <div className="text-xs text-surface-400">
                    Date: {new Date().toLocaleDateString('en-AU')}
                  </div>
                </div>
              </div>

              {/* Client & Project Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-900/60 p-4 rounded-xl border border-surface-800/80 text-xs">
                <div>
                  <span className="text-surface-400 uppercase font-semibold block mb-1">
                    Prepared For
                  </span>
                  <div className="font-bold text-white text-sm">{customerName}</div>
                  <div className="text-surface-300 mt-0.5">{customerEmail}</div>
                  {customerPhone && <div className="text-surface-300">{customerPhone}</div>}
                  {projectAddress && (
                    <div className="text-surface-400 mt-1">{projectAddress}</div>
                  )}
                </div>
                <div>
                  <span className="text-surface-400 uppercase font-semibold block mb-1">
                    Project Scope
                  </span>
                  <div className="font-bold text-white text-sm capitalize">{projectType} Installation</div>
                  <div className="text-surface-300 mt-0.5">
                    Approx. <strong className="text-white">{areaM2} m²</strong> total surface area
                  </div>
                  {isWetArea && (
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800">
                      AS 3740 Waterproofing Included
                    </span>
                  )}
                </div>
              </div>

              {/* Project Scope Narrative */}
              {scopeDescription && (
                <div className="space-y-1.5">
                  <h4 className="text-xs uppercase font-bold text-surface-400 tracking-wider">
                    Executive Scope of Works
                  </h4>
                  <p className="text-xs text-surface-300 leading-relaxed bg-surface-900/40 p-4 rounded-xl border border-surface-800/60 whitespace-pre-wrap">
                    {scopeDescription}
                  </p>
                </div>
              )}

              {/* Technical Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold text-surface-400 tracking-wider">
                  Material & Technical Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-surface-900/40 rounded-xl border border-surface-800/60">
                    <span className="text-surface-400 block text-[10px] uppercase font-semibold">
                      Tile Dimensions
                    </span>
                    <span className="font-medium text-white">
                      {tileLengthMm}x{tileWidthMm}mm ({tileThicknessMm}mm thick)
                    </span>
                  </div>

                  <div className="p-3 bg-surface-900/40 rounded-xl border border-surface-800/60">
                    <span className="text-surface-400 block text-[10px] uppercase font-semibold">
                      Grouting & Joints
                    </span>
                    <span className="font-medium text-white">
                      {groutJointMm}mm joint width, anti-mold polymer grout
                    </span>
                  </div>

                  <div className="p-3 bg-surface-900/40 rounded-xl border border-surface-800/60">
                    <span className="text-surface-400 block text-[10px] uppercase font-semibold">
                      Substrate Preparation
                    </span>
                    <span className="font-medium text-white">
                      Mechanical diamond grind & polymer bonding primer
                    </span>
                  </div>

                  <div className="p-3 bg-surface-900/40 rounded-xl border border-surface-800/60">
                    <span className="text-surface-400 block text-[10px] uppercase font-semibold">
                      Silicone & Perimeters
                    </span>
                    <span className="font-medium text-white">
                      100% neutral cure sanitary perimeter movement joints
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Pricing Box */}
              <div className="bg-gradient-to-br from-surface-900 to-surface-950 p-5 rounded-2xl border border-surface-800 space-y-3">
                <div className="flex justify-between items-center text-xs text-surface-400">
                  <span>Subtotal (Ex GST):</span>
                  <span className="font-mono text-surface-200">
                    ${subtotalExGst.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-surface-400">
                  <span>Australian GST (10%):</span>
                  <span className="font-mono text-surface-200">
                    ${gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-surface-800 pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">
                    Total Fixed Quote (Inc GST):
                  </span>
                  <span className="font-mono text-xl font-extrabold text-emerald-400">
                    ${totalIncGst.toLocaleString(undefined, { minimumFractionDigits: 2 })} AUD
                  </span>
                </div>
              </div>

              {/* Milestone Schedule */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold text-surface-400 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-primary-400" />
                  Staged Trade Payment Milestones
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-3 bg-surface-900/40 rounded-xl border border-surface-800/60 text-center">
                    <span className="text-[10px] text-surface-400 block">10% Deposit</span>
                    <span className="font-mono font-bold text-white mt-1 block">
                      ${deposit10.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-surface-500">Booking lock-in</span>
                  </div>
                  <div className="p-3 bg-surface-900/40 rounded-xl border border-surface-800/60 text-center">
                    <span className="text-[10px] text-surface-400 block">40% Commencement</span>
                    <span className="font-mono font-bold text-white mt-1 block">
                      ${progress40.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-surface-500">Prep & waterproofing</span>
                  </div>
                  <div className="p-3 bg-surface-900/40 rounded-xl border border-surface-800/60 text-center">
                    <span className="text-[10px] text-surface-400 block">50% Completion</span>
                    <span className="font-mono font-bold text-emerald-400 mt-1 block">
                      ${final50.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-surface-500">Final handover</span>
                  </div>
                </div>
              </div>

              {/* Warranty Guarantee */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
                <Shield className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>
                  Backed by our <strong>10-Year Master Workmanship Guarantee</strong> and 7-Year certified AS 3740 waterproofing warranty.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-surface-950 p-5 rounded-2xl border border-surface-800 font-mono text-xs text-surface-300 whitespace-pre-wrap leading-relaxed">
              {proposalText ||
                `PROPOSAL REF: ${quoteNumber}\nCLIENT: ${customerName} (${customerEmail})\nPROJECT: ${projectType} (${areaM2} m²)\nTOTAL: $${totalIncGst.toLocaleString()} AUD (Inc GST)`}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-surface-800 bg-surface-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-5 py-2.5 bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            disabled={isSending || sendSuccess}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>Sending Proposal...</span>
              </>
            ) : sendSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Sent!</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Dispatch Email Proposal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
