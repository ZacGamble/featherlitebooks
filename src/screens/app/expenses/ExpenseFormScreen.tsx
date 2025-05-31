import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Button from '@/components/common/Button/Button';
import { ExpenseStackParamList } from '@/navigation/ExpenseStack';
import { ROUTES } from '@/constants/routes';
import { colors } from '@/constants/colors';
import { Expense } from '@/types';
import * as expenseService from '@/api/expenseService';
import { useAuth } from '@/auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ExpenseStackParamList, typeof ROUTES.EXPENSE_FORM>;

interface ExpenseFormState extends Partial<Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'amount'>> {
  amountString: string;
}

const defaultExpenseDate = new Date().toISOString().split('T')[0];

export const ExpenseFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const expenseId = route.params?.expenseId;
  const isEditing = !!expenseId;

  const [formState, setFormState] = useState<ExpenseFormState>({
    name: '',
    category: '',
    amountString: '0',
    expense_date: defaultExpenseDate,
    vendor: '',
    description: '',
    receipt_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExpenseDetails = useCallback(async (id: string) => {
    setLoading(true);
    setFormError(null);
    try {
      const { data, error } = await expenseService.getExpenseById(id);
      if (error) {
        setFormError(error.message);
        Alert.alert('Error', `Failed to fetch expense details: ${error.message}`);
      } else if (data) {
        setFormState({
          name: data.name || '',
          category: data.category || '',
          amountString: data.amount?.toString() || '0',
          expense_date: (data.expense_date && typeof data.expense_date === 'string') 
                          ? data.expense_date.split('T')[0] 
                          : defaultExpenseDate,
          vendor: data.vendor || '',
          description: data.description || '',
          receipt_url: data.receipt_url || ''
        });
      } else {
        setFormError('Expense not found.');
        Alert.alert('Error', 'Expense not found for editing.');
      }
    } catch (e) {
      const err = e as Error;
      setFormError(err.message);
      Alert.alert('Error', `An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEditing && expenseId) {
      fetchExpenseDetails(expenseId);
    }
  }, [expenseId, isEditing, fetchExpenseDetails]);

  const handleInputChange = (field: keyof ExpenseFormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formState.name?.trim()) {
      setFormError('Expense name is required.');
      return false;
    }
    if (!formState.category?.trim()) {
      setFormError('Category is required.');
      return false;
    }
    const amountNumber = parseFloat(formState.amountString);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setFormError('Amount must be a positive number.');
      return false;
    }
    if (!formState.expense_date?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setFormError('Date must be in YYYY-MM-DD format.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      setFormError('User not authenticated. Cannot save expense.');
      Alert.alert('Error', 'Authentication issue. Please try logging in again.');
      return;
    }
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const amountValue = parseFloat(formState.amountString);

    const expenseDataToSubmit = {
      user_id: user.id,
      name: formState.name!,
      category: formState.category!,
      amount: amountValue,
      expense_date: formState.expense_date!,
      vendor: formState.vendor || null,
      description: formState.description || null,
      receipt_url: formState.receipt_url || null,
    };

    try {
      let result;
      if (isEditing && expenseId) {
        result = await expenseService.updateExpense(expenseId, expenseDataToSubmit);
      } else {
        result = await expenseService.createExpense(expenseDataToSubmit as Omit<Expense, 'id' | 'created_at' | 'updated_at'>);
      }

      if (result.error) {
        setFormError(result.error.message);
        Alert.alert('Save Error', result.error.message);
      } else if (result.data) {
        Alert.alert('Success', `Expense ${isEditing ? 'updated' : 'created'} successfully!`)
        if (!isEditing && result.data.id) {
            navigation.replace(ROUTES.EXPENSE_DETAIL, { expenseId: result.data.id });
        } else {
            navigation.goBack();
        }
      } else {
        setFormError('An unknown error occurred while saving.');
        Alert.alert('Save Error', 'An unknown error occurred.');
      }
    } catch (e) {
      const err = e as Error;
      setFormError(err.message);
      Alert.alert('Save Error', `An unexpected error occurred: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Loading form...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container}> 
        <View style={styles.topBarContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={28} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>{isEditing ? 'Edit Expense' : 'Create New Expense'}</Text>
            <View style={{width: 40}} />
        </View>

        {formError && <Text style={styles.errorText}>{formError}</Text>}

        <Text style={styles.label}>Expense Name *</Text>
        <TextInput placeholder="e.g., Team Lunch" value={formState.name || ''} onChangeText={(val) => handleInputChange('name', val)} style={styles.input} placeholderTextColor={colors.placeholderText} />
        
        <Text style={styles.label}>Category *</Text>
        <TextInput placeholder="e.g., Meals, Travel, Software" value={formState.category || ''} onChangeText={(val) => handleInputChange('category', val)} style={styles.input} placeholderTextColor={colors.placeholderText} />
        
        <Text style={styles.label}>Amount *</Text>
        <TextInput 
          placeholder="e.g., 45.99" 
          value={formState.amountString || '0'} 
          onChangeText={(val) => handleInputChange('amountString', val)} 
          style={styles.input} 
          keyboardType="numeric" 
          placeholderTextColor={colors.placeholderText} 
        />
        
        <Text style={styles.label}>Date *</Text>
        <TextInput placeholder="YYYY-MM-DD" value={formState.expense_date || ''} onChangeText={(val) => handleInputChange('expense_date', val)} style={styles.input} maxLength={10} placeholderTextColor={colors.placeholderText} />

        <Text style={styles.label}>Vendor</Text>
        <TextInput placeholder="e.g., Office Supplies Inc." value={formState.vendor || ''} onChangeText={(val) => handleInputChange('vendor', val)} style={styles.input} placeholderTextColor={colors.placeholderText} />
        
        <Text style={styles.label}>Description</Text>
        <TextInput placeholder="Detailed notes about the expense" value={formState.description || ''} onChangeText={(val) => handleInputChange('description', val)} style={styles.input} multiline numberOfLines={4} placeholderTextColor={colors.placeholderText} />

        {isEditing && formState.receipt_url && (
            <View style={styles.receiptUrlContainer}>
                <Text style={styles.label}>Receipt URL:</Text>
                <Text style={styles.receiptUrlText} selectable>{formState.receipt_url}</Text>
            </View>
        )}

        <Button title={isEditing ? 'Save Changes' : 'Create Expense'} onPress={handleSubmit} loading={isSubmitting} style={styles.button} />
        {isEditing && (
          <Button title="Cancel Edit" onPress={() => navigation.goBack()} variant="outline" style={styles.button} disabled={isSubmitting} />
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centerAlign: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 15, paddingBottom: 40 },
  topBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    marginBottom:10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  backButton: { padding: 5 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    color: colors.text,
  },
  button: {
    marginTop: 15,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  receiptUrlContainer: {
    marginTop: 10,
    marginBottom: 15,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  receiptUrlText: {
    color: colors.primary,
    textDecorationLine: 'underline'
  }
});

export default ExpenseFormScreen; 