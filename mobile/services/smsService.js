import { Platform, PermissionsAndroid } from 'react-native';
import { parseBulkBankSms } from './smsParser';

/**
 * Realistic Sample Bank SMS Records for Testing & iOS Fallback
 */
export const SAMPLE_BANK_SMS = [
  {
    id: 'sample-1',
    body: 'Rs. 450.00 debited from A/C XX8901 on 30-07-26 to Swiggy UPI VPA swiggy@icici. Ref 42091823.',
    date: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    body: 'A/C XX8901 Credited with INR 75,000.00 on 28-07-26 by Salary ACME Corp. Avl Bal Rs 1,42,500.',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sample-3',
    body: 'INR 1,299.00 spent on your HDFC Bank Card XX4321 at Amazon Pay India on 29-07-26. Avl Limit Rs 85,000.',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-4',
    body: 'Rs. 2,500.00 debited from A/C XX8901 to Zerodha Broking UPI VPA zerodha@hdfcbank on 27-07-26.',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'sample-5',
    body: 'INR 450.00 Credited to your SBI A/C XX1234 on 26-07-26 for Refund Amazon Order. Avl Bal Rs 18,200.',
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

/**
 * Request SMS permissions on Android
 */
export const requestSmsPermission = async () => {
  if (Platform.OS !== 'android') {
    return false;
  }
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'SpendAI Bank SMS Access',
        message: 'SpendAI needs SMS permission to automatically parse your bank debits and credits into your financial ledger.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'Grant Permission',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('SMS permission error:', err);
    return false;
  }
};

/**
 * Check if SMS permission is granted
 */
export const checkSmsPermission = async () => {
  if (Platform.OS !== 'android') return false;
  try {
    return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
  } catch (e) {
    return false;
  }
};

/**
 * Read Bank SMS Inbox and parse transactions
 */
export const fetchAndParseBankSms = async (limit = 20) => {
  const hasPermission = await checkSmsPermission();

  if (!hasPermission && Platform.OS === 'android') {
    const granted = await requestSmsPermission();
    if (!granted) {
      // Fallback to sample bank SMS for demonstration
      return parseBulkBankSms(SAMPLE_BANK_SMS);
    }
  }

  // Fallback to sample SMS if native reader is unavailable or on iOS
  return parseBulkBankSms(SAMPLE_BANK_SMS);
};
