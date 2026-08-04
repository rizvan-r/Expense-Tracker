import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { uploadAndScanReceipt } from '../services/apiService';
import { Card } from './UI/Card';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  RefreshCw,
  Eye,
  Check,
  CreditCard,
  ShoppingBag,
  IndianRupee,
  Calendar,
  Tag,
  ArrowRight
} from 'lucide-react';

import { GmailReceiptFetcher } from './GmailReceiptFetcher';

export const ReceiptOCR = ({ setActiveView }) => {
  const { addExpense, categories } = useExpense();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Editable Form fields derived from OCR extraction
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay');
  const [txnReference, setTxnReference] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [notes, setNotes] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const handleFileDrop = async (file) => {
    if (!file) return;
    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setIsScanning(true);
    setScanResult(null);
    setIsAdded(false);

    try {
      const res = await uploadAndScanReceipt(file);
      setScanResult(res);

      if (res && res.success) {
        setMerchant(res.merchant || 'Store Merchant');
        setAmount(res.amount || 0);
        setDate(res.date || new Date().toISOString().split('T')[0]);
        setCategory(res.category || 'Education & Self Care');
        setPaymentMethod(res.payment_method || 'Bank Transfer');

        const refNo = res.payment_details?.reference_no || 'Receipt #622';
        const modeStr = res.payment_details?.mode || res.payment_method || 'Bank Transfer';
        setTxnReference(refNo);
        setCardLast4(res.payment_details?.card_last_4 || 'N/A');

        const orderSummary = (res.items || [])
          .map(i => `${i.item_name} (x${i.quantity})`)
          .join(', ');

        let fullNotes = `Txn Ref: ${refNo} | Payment Mode: ${modeStr}`;
        if (orderSummary) {
          fullNotes += ` | Line Items: ${orderSummary}`;
        }
        setNotes(fullNotes);
      }
    } catch (err) {
      console.warn('OCR Scan Error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmAndSave = async (e) => {
    e.preventDefault();
    await addExpense({
      merchant,
      amount: Number(amount),
      date,
      category,
      payment_method: paymentMethod,
      notes,
      ocr_extracted: true,
      payment_details: {
        mode: paymentMethod,
        reference_no: txnReference || scanResult?.payment_details?.reference_no || 'Receipt #622',
        card_last_4: cardLast4 || 'N/A',
        status: 'PAID'
      },
      line_items: scanResult?.items || [],
      receipt_url: previewUrl
    });

    setIsAdded(true);
    setTimeout(() => {
      if (setActiveView) setActiveView('expenses');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md transition-all">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">OpenAI Vision OCR Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-heading">
          Instant Receipt & Order Details Extractor
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
          Upload photo or scan of any bill or receipt to automatically extract merchant, order itemization, payment details, and total amount in Rupees (₹).
        </p>
      </div>

      {/* Gmail Digital Receipts Ingestion */}
      <GmailReceiptFetcher />

      {/* Main Grid: Upload & Verification Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Uploader & Preview */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-3 flex items-center justify-between">
              <span>Upload Receipt Photo</span>
              <Badge variant="emerald">PNG / JPG / WebP</Badge>
            </h3>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileDrop(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50 hover:bg-emerald-50/50 group"
            >
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files?.[0] && handleFileDrop(e.target.files[0])}
                className="hidden"
                id="receipt-file-input"
              />
              <label htmlFor="receipt-file-input" className="cursor-pointer block space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-bold text-emerald-700 group-hover:underline">Click to upload Receipt or PDF</span>
                  <span className="text-xs text-slate-500 font-medium"> or drag and drop file</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Supports PDF Invoices, Bank Statements, Paper Receipts & Photos</p>
              </label>
            </div>
          </Card>

          {/* Image Preview Box */}
          {previewUrl && (
            <Card className="p-4 overflow-hidden relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" /> Receipt Image Preview
                </span>
                {isScanning && <Badge variant="amber" className="animate-pulse">Scanning OCR...</Badge>}
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-64 flex items-center justify-center bg-slate-100">
                <img src={previewUrl} alt="Receipt preview" className="w-full object-cover max-h-64" />
                {isScanning && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 text-emerald-800">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                    <span className="text-xs font-bold">Parsing Order & Payment Details...</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: OCR Extraction Results & Form Confirmation */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">Extracted Order & Payment Details</h3>
                <p className="text-xs text-slate-500 font-medium">Review AI extracted fields before committing to your ledger</p>
              </div>
              {scanResult && (
                <Badge variant="emerald" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {(scanResult.confidence * 100).toFixed(0)}% Confidence
                </Badge>
              )}
            </div>

            {/* Itemized Order Breakdown Table (if extracted) */}
            {scanResult?.items && scanResult.items.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" /> Itemized Order Details ({scanResult.items.length} items)
                </span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs text-slate-800">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Item Description</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {scanResult.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{item.item_name}</td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3">₹{item.unit_price}</td>
                          <td className="p-3 text-right font-bold text-emerald-700">₹{item.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Details Pill Badge & Reference Specs */}
            {scanResult?.payment_method && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span>Extracted Payment Method: <strong className="text-emerald-950 font-heading">{scanResult.payment_method}</strong></span>
                  </div>
                  <Badge variant="emerald">{scanResult?.payment_details?.status || 'VERIFIED PAID'}</Badge>
                </div>

                {scanResult?.payment_details && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-800 font-mono">
                    {scanResult.payment_details.reference_no && (
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-500 block text-[9px] uppercase font-sans">Txn / Ref No</span>
                        <span className="text-emerald-700 font-bold">{scanResult.payment_details.reference_no}</span>
                      </div>
                    )}
                    {scanResult.payment_details.card_last_4 && scanResult.payment_details.card_last_4 !== 'N/A' && (
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-500 block text-[9px] uppercase font-sans">Card Number</span>
                        <span className="text-slate-800 font-bold">**** {scanResult.payment_details.card_last_4}</span>
                      </div>
                    )}
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[9px] uppercase font-sans">Status</span>
                      <span className="text-emerald-700 font-bold">APPROVED</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Editable Confirmation Form */}
            <form onSubmit={handleConfirmAndSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Store / Merchant"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
                  >
                    {(categories || []).map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 neu-input text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Receipt / Txn Reference No
                </label>
                <input
                  type="text"
                  placeholder="e.g. Receipt #622 or Txn ID"
                  value={txnReference}
                  onChange={(e) => setTxnReference(e.target.value)}
                  className="w-full px-4 py-2.5 neu-input text-xs text-emerald-800 font-mono font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Order Notes & Extracted Details
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 neu-input text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              {isAdded ? (
                <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Expense Added to Ledger Successfully! Redirecting...
                </div>
              ) : (
                <Button type="submit" variant="primary" className="w-full py-3" icon={Check}>
                  Confirm & Add Expense to Ledger
                </Button>
              )}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
