import React, { useState, useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { Card } from './UI/Card';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';
import { Modal } from './UI/Modal';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Download,
  Receipt,
  FileText,
  Calendar,
  CreditCard,
  Tag,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const ExpenseManager = ({ isAddModalOpen, setIsAddModalOpen }) => {
  const { expenses, categories, addExpense, updateExpense, deleteExpense } = useExpense();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [editingExpense, setEditingExpense] = useState(null);

  // Form fields for Add/Edit
  const [formMerchant, setFormMerchant] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food & Dining');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState('Credit Card');
  const [formNotes, setFormNotes] = useState('');

  const resetForm = () => {
    setFormMerchant('');
    setFormAmount('');
    setFormCategory('Food & Dining');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPaymentMethod('Credit Card');
    setFormNotes('');
    setEditingExpense(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingExpense(exp);
    setFormMerchant(exp.merchant);
    setFormAmount(exp.amount.toString());
    setFormCategory(exp.category || 'Food & Dining');
    setFormDate(exp.date || new Date().toISOString().split('T')[0]);
    setFormPaymentMethod(exp.payment_method || 'Credit Card');
    setFormNotes(exp.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formMerchant || !formAmount) return;

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        merchant: formMerchant,
        amount: Number(formAmount),
        category: formCategory,
        date: formDate,
        payment_method: formPaymentMethod,
        notes: formNotes
      });
    } else {
      addExpense({
        merchant: formMerchant,
        amount: Number(formAmount),
        category: formCategory,
        date: formDate,
        payment_method: formPaymentMethod,
        notes: formNotes
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  // Filtered expense list
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = exp.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || exp.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, selectedCategory]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Merchant', 'Category', 'Amount', 'Payment Method', 'Notes'];
    const rows = filteredExpenses.map(e => [
      e.id,
      e.date,
      `"${e.merchant.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount,
      `"${e.payment_method || ''}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">Expense Ledger</h1>
          <p className="text-sm text-slate-400">View, search, edit, and log transactions with custom categorization.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Plus} onClick={openAddModal}>
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search merchant or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Categories ({expenses.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Expense Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Merchant & Note</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Receipt</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => {
                  const catObj = categories.find(c => c.name === exp.category);
                  const color = catObj ? catObj.color : '#6366f1';
                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {exp.merchant}
                        </div>
                        {exp.notes && (
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{exp.notes}</div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                            borderColor: `${color}30`
                          }}
                        >
                          {exp.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400">
                        {exp.date}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400">
                        {exp.payment_method || 'Credit Card'}
                      </td>

                      <td className="px-6 py-4 text-right font-bold text-white font-heading">
                        ₹{Number(exp.amount).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        {exp.receipt_url ? (
                          <a
                            href={exp.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                            title="View Receipt Image"
                          >
                            <Receipt className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </a>
                        ) : exp.ocr_extracted ? (
                          <Badge variant="cyan">OCR Parsed</Badge>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            title="Edit Expense"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={editingExpense ? 'Edit Expense Record' : 'Add New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Merchant / Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Whole Foods, Starbucks, Amazon"
                value={formMerchant}
                onChange={(e) => setFormMerchant(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Transaction Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={formPaymentMethod}
                onChange={(e) => setFormPaymentMethod(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Apple Pay">Apple Pay</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Notes / Tags
              </label>
              <input
                type="text"
                placeholder="Optional description"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingExpense ? 'Save Changes' : 'Confirm & Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
