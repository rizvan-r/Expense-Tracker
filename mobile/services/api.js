import axios from 'axios';
import { Platform } from 'react-native';

// Default FastAPI Python Backend URL depending on environment
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_FASTAPI_URL) {
    return process.env.EXPO_PUBLIC_FASTAPI_URL;
  }
  // Android Emulator uses 10.0.2.2 to refer to host localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 40000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Upload image file for AI OCR Scanning
 */
export const scanReceiptFile = async (imageUri, fileName = 'receipt.jpg', fileType = 'image/jpeg') => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: fileName,
    type: fileType,
  });

  const response = await axios.post(`${API_BASE_URL}/api/ocr/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000,
  });
  return response.data;
};

/**
 * Send message to SpendAI Conversational Assistant
 */
export const sendAIChatMessage = async (userMessage, chatHistory = [], userContext = {}) => {
  const response = await apiClient.post('/api/ai/chat', {
    message: userMessage,
    chat_history: chatHistory,
    user_context: userContext,
  });
  return response.data;
};

/**
 * Fetch Budget Trend Prediction from ML model
 */
export const fetchBudgetTrend = async (monthlyBudget, expenses = []) => {
  const response = await apiClient.post('/api/ai/predict-budget', {
    monthly_budget: Number(monthlyBudget),
    expenses: expenses,
  });
  return response.data;
};

/**
 * Fetch Financial Health Score (0-100)
 */
export const fetchHealthScore = async (monthlyBudget, expenses = []) => {
  const response = await apiClient.post('/api/ai/health-score', {
    monthly_budget: Number(monthlyBudget),
    expenses: expenses,
  });
  return response.data;
};
