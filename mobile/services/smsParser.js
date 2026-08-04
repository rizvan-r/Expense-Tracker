/**
 * SpendAI Bank SMS Parser Engine
 * Handles SMS messages from HDFC, SBI, ICICI, Axis, Kotak, PhonePe, GPay, Paytm, etc.
 */

// Category Auto-matching Rules
const CATEGORY_RULES = [
  { category: 'Food & Dining', keywords: ['swiggy', 'zomato', 'starbucks', 'mcdonald', 'kfc', 'domino', 'pizza', 'restaurant', 'cafe', 'food', 'bakery', 'tea'] },
  { category: 'Shopping', keywords: ['amazon', 'flipkart', 'myntra', 'meesho', 'reliancedigital', 'dmart', 'uniqlo', 'zara', 'ajio', 'nykaa', 'shopping'] },
  { category: 'Utilities & Bills', keywords: ['electricity', 'water', 'gas', 'bescom', 'jio', 'airtel', 'vi', 'broadband', 'recharge', 'subscript'] },
  { category: 'Transportation', keywords: ['uber', 'ola', 'rapido', 'irctc', 'redbus', 'metro', 'petrol', 'shell', 'hpcl', 'bpcl', 'fuel', 'fastag'] },
  { category: 'Health & Wellness', keywords: ['apollo', 'pharmeasy', '1mg', 'cultfit', 'gym', 'hospital', 'clinic', 'medical', 'pharmacy'] },
  { category: 'Investment & SIP', keywords: ['zerodha', 'groww', 'upstox', 'coin', 'mutual', 'sip', 'nse', 'bse', 'lic', 'insurance'] },
];

const autoCategorize = (merchantOrText) => {
  const text = (merchantOrText || '').toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => text.includes(k))) {
      return rule.category;
    }
  }
  return 'General';
};

/**
 * Parses a raw SMS text into a structured financial transaction object.
 */
export const parseBankSms = (smsBody, smsDate = null) => {
  if (!smsBody || typeof smsBody !== 'string') return null;

  const text = smsBody.trim();
  const lowerText = text.toLowerCase();

  // Filter out non-financial SMS messages
  const isFinancial = /(debited|credited|spent|paid|received|transferred|deposited|withdrawn|refund|vpa|a\/c|inr|rs\.)/i.test(text);
  if (!isFinancial) return null;

  // 1. Determine Type: DEBIT vs CREDIT
  let type = 'DEBIT'; // default
  const isCredit = /(credited|received|deposited|added|refund|salary)/i.test(lowerText) &&
                  !/(credited to user|to be credited)/i.test(lowerText);
  if (isCredit) {
    type = 'CREDIT';
  }

  // 2. Extract Amount (₹ / INR / Rs.)
  let amount = 0;
  const amountMatch = text.match(/(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i) ||
                      text.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:debited|credited|spent|paid|received)/i);
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return null; // Skip invalid amounts
  }

  // 3. Extract Merchant / Beneficiary / Sender
  let merchant = 'Bank Transaction';
  const merchantMatch = text.match(/(?:at|to|info|VPA|ref|towards|from)\s+([A-Za-z0-9\s._@-]{3,30}?)(?=\s+(?:on|ref|avl|bal|acc|date|via|using|\.|$))/i) ||
                        text.match(/(?:paid to|received from)\s+([A-Za-z0-9\s._-]+)/i);
  if (merchantMatch && merchantMatch[1]) {
    merchant = merchantMatch[1].trim().replace(/^(the|a)\s+/i, '');
  }

  // Clean up merchant name
  if (merchant.length > 30) {
    merchant = merchant.substring(0, 30);
  }

  // 4. Extract Account / Card Last 4 digits
  let accountLast4 = '';
  const accMatch = text.match(/(?:A\/C|Acct|card|ending)\s*(?:no\.?)?\s*([Xx*]*\d{4})/i);
  if (accMatch && accMatch[1]) {
    accountLast4 = accMatch[1].slice(-4);
  }

  // 5. Extract Date
  let parsedDate = smsDate ? new Date(smsDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const dateMatch = text.match(/(\d{2}[-/\.]\d{2}[-/\.]\d{2,4})/);
  if (dateMatch && dateMatch[1]) {
    try {
      const parts = dateMatch[1].split(/[-/\.]/);
      if (parts.length === 3) {
        let day = parts[0].padStart(2, '0');
        let month = parts[1].padStart(2, '0');
        let year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        parsedDate = `${year}-${month}-${day}`;
      }
    } catch (e) {}
  }

  // 6. Category
  const category = autoCategorize(`${merchant} ${text}`);

  return {
    id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type, // 'DEBIT' (Expense) or 'CREDIT' (Income)
    amount,
    merchant,
    category,
    account_last4: accountLast4,
    date: parsedDate,
    raw_sms: text,
    payment_method: text.toLowerCase().includes('upi') ? 'UPI' : text.toLowerCase().includes('card') ? 'Credit Card' : 'Net Banking',
  };
};

/**
 * Bulk parse array of SMS messages.
 */
export const parseBulkBankSms = (smsList = []) => {
  const parsed = [];
  smsList.forEach(sms => {
    const item = parseBankSms(sms.body || sms.text || sms, sms.date || sms.timestamp);
    if (item) {
      parsed.push(item);
    }
  });
  return parsed;
};
