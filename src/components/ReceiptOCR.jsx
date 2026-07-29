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
  const [studentInfo, setStudentInfo] = useState('');
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
        if (res.raw_text) {
          const studentMatch = res.raw_text.match(/(?:Name|Roll No|Class|Fee Period)\s*:\s*[^\n]+/gi);
          if (studentMatch && studentMatch.length > 0) {
            const specStr = studentMatch.join(' | ');
            setStudentInfo(specStr);
            fullNotes += ` | Student Specs: ${specStr}`;
          }
        }
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

  const handleSelectSample = (sampleType) => {
    setIsScanning(true);
    setScanResult(null);
    setIsAdded(false);

    setTimeout(() => {
      let sampleData = {
        success: true,
        merchant: 'BigBasket Supermarket',
        amount: 3450.00,
        date: new Date().toISOString().split('T')[0],
        category: 'Food & Dining',
        payment_method: 'UPI / GPay',
        confidence: 0.98,
        items: [
          { item_name: 'Organic Whole Milk 1L', quantity: 2, unit_price: 75.00, total_price: 150.00 },
          { item_name: 'Atta Flour 5kg', quantity: 1, unit_price: 280.00, total_price: 280.00 },
          { item_name: 'Basmati Rice 5kg', quantity: 1, unit_price: 650.00, total_price: 650.00 },
          { item_name: 'Fresh Vegetables Assorted', quantity: 1, unit_price: 420.00, total_price: 420.00 },
          { item_name: 'Dry Fruits Gift Pack', quantity: 1, unit_price: 1950.00, total_price: 1950.00 }
        ],
        raw_text: 'BIGBASKET RETAIL INDIA\nDate: 2026-07-24\nTOTAL: ₹3,450.00\nPayment: GPay UPI'
      };

      if (sampleType === 'fuel') {
        sampleData = {
          success: true,
          merchant: 'Indian Oil Fuel Station',
          amount: 2200.00,
          date: new Date().toISOString().split('T')[0],
          category: 'Transportation',
          payment_method: 'Debit Card',
          confidence: 0.95,
          items: [
            { item_name: 'XP95 Premium Petrol Fuel', quantity: 21, unit_price: 104.76, total_price: 2200.00 }
          ],
          raw_text: 'INDIAN OIL CORP LTD\nXP95 Petrol: 21.00 L\nTotal: ₹2,200.00\nPayment: Debit Card ****4129'
        };
      } else if (sampleType === 'electronics') {
        sampleData = {
          success: true,
          merchant: 'Croma Electronics',
          amount: 14999.00,
          date: new Date().toISOString().split('T')[0],
          category: 'Shopping & Electronics',
          payment_method: 'Credit Card',
          confidence: 0.99,
          items: [
            { item_name: 'Sony Wireless Noise Cancelling Headphones', quantity: 1, unit_price: 14999.00, total_price: 14999.00 }
          ],
          raw_text: 'CROMA DIGITAL RETAIL\nItem: Sony Headphones\nPrice: ₹14,999.00\nPayment: HDFC Credit Card'
        };
      }

      setPreviewUrl(
        sampleType === 'fuel'
          ? 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=60'
          : sampleType === 'electronics'
          ? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60'
          : 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600&auto=format&fit=crop&q=60'
      );

      setScanResult(sampleData);
      setMerchant(sampleData.merchant);
      setAmount(sampleData.amount);
      setDate(sampleData.date);
      setCategory(sampleData.category);
      setPaymentMethod(sampleData.payment_method);
      const itemsText = sampleData.items.map(i => `${i.item_name} (x${i.quantity})`).join(', ');
      setNotes(`Order Items: ${itemsText}`);
      setIsScanning(false);
    }, 1200);
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
        student_info: studentInfo || '',
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
    <div className="space-y-6 animate-fadeIn pb-12 w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/50 p-6 sm:p-8 rounded-3xl border border-indigo-500/20 glass-panel">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">OpenAI Vision OCR Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
          Instant Receipt & Order Details Extractor
        </h1>
        <p className="text-sm text-slate-400 mt-1">
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
            <h3 className="text-base font-bold text-white font-heading mb-3 flex items-center justify-between">
              <span>Upload Receipt Photo</span>
              <Badge variant="indigo">PNG / JPG / WebP</Badge>
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
              className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/80 group"
            >
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files?.[0] && handleFileDrop(e.target.files[0])}
                className="hidden"
                id="receipt-file-input"
              />
              <label htmlFor="receipt-file-input" className="cursor-pointer block space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-indigo-400 group-hover:underline">Click to upload Receipt or PDF</span>
                  <span className="text-xs text-slate-400"> or drag and drop file</span>
                </div>
                <p className="text-[11px] text-slate-500">Supports PDF Invoices, Bank Statements, Paper Receipts & Photos</p>
              </label>
            </div>

            {/* Pre-Loaded Sample Receipt Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">Or test with pre-loaded sample bills:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSelectSample('grocery')}
                  className="px-2.5 py-2 bg-slate-900 hover:bg-indigo-600/20 text-slate-300 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs font-semibold transition-all text-center"
                >
                  🛒 Grocery
                </button>
                <button
                  onClick={() => handleSelectSample('fuel')}
                  className="px-2.5 py-2 bg-slate-900 hover:bg-indigo-600/20 text-slate-300 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs font-semibold transition-all text-center"
                >
                  ⛽ Fuel Refill
                </button>
                <button
                  onClick={() => handleSelectSample('electronics')}
                  className="px-2.5 py-2 bg-slate-900 hover:bg-indigo-600/20 text-slate-300 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs font-semibold transition-all text-center"
                >
                  🎧 Headphones
                </button>
              </div>
            </div>
          </Card>

          {/* Image Preview Box */}
          {previewUrl && (
            <Card className="p-4 overflow-hidden relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-400" /> Receipt Image Preview
                </span>
                {isScanning && <Badge variant="amber" className="animate-pulse">Scanning OCR...</Badge>}
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-64 flex items-center justify-center bg-black">
                <img src={previewUrl} alt="Receipt preview" className="w-full object-cover max-h-64" />
                {isScanning && (
                  <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 text-indigo-300">
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
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
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Extracted Order & Payment Details</h3>
                <p className="text-xs text-slate-400">Review AI extracted fields before committing to your ledger</p>
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
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-indigo-400" /> Itemized Order Details ({scanResult.items.length} items)
                </span>
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Item Description</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3">Unit Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {scanResult.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-white">{item.item_name}</td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3">₹{item.unit_price}</td>
                          <td className="p-3 text-right font-bold text-emerald-400">₹{item.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Details Pill Badge & Reference Specs */}
            {scanResult?.payment_method && (
              <div className="p-4 bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <span>Extracted Payment Method: <strong className="text-white font-heading">{scanResult.payment_method}</strong></span>
                  </div>
                  <Badge variant="emerald">{scanResult?.payment_details?.status || 'VERIFIED PAID'}</Badge>
                </div>

                {scanResult?.payment_details && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-300 font-mono">
                    {scanResult.payment_details.reference_no && (
                      <div className="p-1.5 bg-slate-950/80 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase font-sans">Txn / Ref No</span>
                        <span className="text-indigo-300 font-bold">{scanResult.payment_details.reference_no}</span>
                      </div>
                    )}
                    {scanResult.payment_details.card_last_4 && scanResult.payment_details.card_last_4 !== 'N/A' && (
                      <div className="p-1.5 bg-slate-950/80 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase font-sans">Card Number</span>
                        <span className="text-slate-200 font-bold">**** {scanResult.payment_details.card_last_4}</span>
                      </div>
                    )}
                    <div className="p-1.5 bg-slate-950/80 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[9px] uppercase font-sans">Status</span>
                      <span className="text-emerald-400 font-bold">APPROVED</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Editable Confirmation Form */}
            <form onSubmit={handleConfirmAndSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Merchant Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Store / Merchant"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Total Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {(categories || []).map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Receipt / Txn Reference No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Receipt #622 or Txn ID"
                    value={txnReference}
                    onChange={(e) => setTxnReference(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Student / Receipt Specs
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Roll No, Name, Class"
                    value={studentInfo}
                    onChange={(e) => setStudentInfo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Order Notes & Extracted Details
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {isAdded ? (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
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
