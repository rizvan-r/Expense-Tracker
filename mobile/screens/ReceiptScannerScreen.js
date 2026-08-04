import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { scanReceiptFile } from '../services/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Camera, Image as ImageIcon, Sparkles, Check, ArrowLeft, RefreshCw } from 'lucide-react-native';

const isValidUUID = (str) =>
  str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default function ReceiptScannerScreen({ navigation }) {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [ocrData, setOcrData] = useState(null);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera Permission Required', 'Permission to access camera is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      processImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri) => {
    setImageUri(uri);
    setOcrData(null);
    setLoading(true);
    try {
      const response = await scanReceiptFile(uri);
      if (response && response.success !== false) {
        setOcrData(response);
      } else {
        Alert.alert('Scan Result', response.message || 'Could not parse text from receipt.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      Alert.alert(
        'FastAPI OCR Scanner Error',
        'Ensure the FastAPI server is running on http://192.168.1.6:8000.\n' + (err.message || '')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!ocrData) return;
    setSaveLoading(true);
    try {
      const today = ocrData.date || new Date().toISOString().split('T')[0];
      const validUserId = isValidUUID(user?.id) ? user.id : null;

      const newRecord = {
        user_id: validUserId,
        amount: Number(ocrData.total_amount) || 0,
        merchant: ocrData.merchant || 'Scanned Receipt',
        category: ocrData.category || 'General',
        payment_method: ocrData.payment_method || 'UPI',
        date: today,
        notes: `Scanned Receipt - Category: ${ocrData.category || 'General'}`,
        created_at: new Date().toISOString(),
      };

      let { error } = await supabase.from('expenses').insert([newRecord]);

      // If foreign key constraint failed (user_id not in public.users), retry with null user_id
      if (error && (error.message?.includes('expenses_user_id_fkey') || error.code === '23503')) {
        const fallbackRecord = { ...newRecord, user_id: null };
        const res = await supabase.from('expenses').insert([fallbackRecord]);
        error = res.error;
      }

      // If category column missing in Supabase schema, retry without category column
      if (error && (error.message?.includes('category') || error.code === 'PGRST204')) {
        const fallbackRecord = { ...newRecord, user_id: validUserId };
        delete fallbackRecord.category;
        const res = await supabase.from('expenses').insert([fallbackRecord]);
        error = res.error;
      }

      if (error) throw error;

      Alert.alert('Success', 'Scanned receipt logged into Supabase!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Save Failed', err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Receipt Scanner</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.infoBanner}>
          <Sparkles size={18} color="#047857" />
          <Text style={styles.infoText}>
            Powered by Groq Llama-3.3-70b & OpenAI Vision. Snap invoice photos or upload receipts.
          </Text>
        </View>

        {/* Image Preview / Picker Box */}
        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => {
                setImageUri(null);
                setOcrData(null);
              }}
            >
              <RefreshCw size={16} color="#64748b" />
              <Text style={styles.retakeText}>Retake Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Capture or Choose Receipt</Text>
            <Text style={styles.pickerSub}>PNG, JPG, JPEG Invoices supported</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.pickBtn} onPress={takePhoto}>
                <Camera size={20} color="#059669" />
                <Text style={styles.btnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pickBtn, styles.galleryBtn]} onPress={pickImage}>
                <ImageIcon size={20} color="#2563eb" />
                <Text style={[styles.btnText, { color: '#2563eb' }]}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* OCR Result View */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Analyzing Receipt with AI Vision Engine...</Text>
          </View>
        )}

        {ocrData && !loading && (
          <View style={styles.ocrCard}>
            <Text style={styles.cardHeader}>AI Extracted Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Merchant:</Text>
              <Text style={styles.detailValue}>{ocrData.merchant || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount:</Text>
              <Text style={[styles.detailValue, styles.amountHighlight]}>
                ₹{Number(ocrData.total_amount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{ocrData.category || 'General'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method:</Text>
              <Text style={styles.detailValue}>{ocrData.payment_method || 'UPI'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{ocrData.date || 'Today'}</Text>
            </View>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmAndSave}
              disabled={saveLoading}
            >
              {saveLoading ? (
                <ActivityIndicator color="#059669" />
              ) : (
                <>
                  <Check size={20} color="#059669" style={{ marginRight: 8 }} />
                  <Text style={styles.confirmBtnText}>Confirm & Log Expense</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    color: '#047857',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  pickerBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  pickerTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pickerSub: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
  },
  pickBtn: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  galleryBtn: {
    borderColor: '#2563eb',
  },
  btnText: {
    color: '#059669',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: 8,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#64748b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  retakeText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 12,
  },
  ocrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    color: '#047857',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  detailValue: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '500',
  },
  amountHighlight: {
    color: '#059669',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  confirmBtnText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
