import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import CustomDatePicker from '@/components/forms/DatePicker';
import { ExpenseStackParamList } from '@/navigation/AppTabs';
import { ROUTES } from '@/constants/routes';
import { Expense } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';

type ExpenseFormScreenProps = NativeStackScreenProps<ExpenseStackParamList, typeof ROUTES.EXPENSE_FORM>;

export const ExpenseFormScreen: React.FC<ExpenseFormScreenProps> = ({ navigation, route }) => {
  const expenseId = route.params?.expenseId;
  const isEditing = !!expenseId;

  const [expenseName, setExpenseName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (isEditing && expenseId) {
      fetchExpenseDetails(expenseId);
    }
  }, [expenseId, isEditing]);

  const fetchExpenseDetails = async (id: string) => {
    setLoading(true);
    // Mock fetch for now
    const MOCK_EDIT_EXPENSE: Expense = { id: '1', expense_name: 'Edited Office Supplies', category: 'Office', amount: 80.00, date: new Date().toISOString(), vendor: 'Office Depot', description: 'Pens and paper' };
    if (id === '1') {
        setExpenseName(MOCK_EDIT_EXPENSE.expense_name);
        setCategory(MOCK_EDIT_EXPENSE.category);
        setAmount(MOCK_EDIT_EXPENSE.amount.toString());
        setDate(new Date(MOCK_EDIT_EXPENSE.date));
        setVendor(MOCK_EDIT_EXPENSE.vendor || '');
        setDescription(MOCK_EDIT_EXPENSE.description || '');
    } else {
        setFormError('Expense not found for editing.');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!expenseName || !category || !amount || !date) {
      setFormError('Please fill in all required fields (Name, Category, Amount, Date).');
      return;
    }
    if (!user) {
        setFormError('User not authenticated. Cannot save expense.');
        return;
    }

    setLoading(true);
    const expenseData = {
      expense_name: expenseName,
      category,
      amount: parseFloat(amount) || 0,
      date: date.toISOString(),
      vendor: vendor || null,
      description: description || null,
      user_id: user.id,
    };

    // Mock Submit
    Alert.alert('Mock Submit', `Expense ${isEditing ? 'updated' : 'recorded'}: ${expenseName}`);
    setLoading(false);
    navigation.goBack();
  };

  if (loading && isEditing && !expenseName) {
    return <ScreenContainer><Text style={styles.loadingText}>Loading expense details...</Text></ScreenContainer>;
  }

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEditing ? 'Edit Expense' : 'Record New Expense'}</Text>
        {formError && <Text style={styles.errorText}>{formError}</Text>}

        <Input label="Expense Name *" value={expenseName} onChangeText={setExpenseName} placeholder="e.g., Lunch Meeting" />
        <Input label="Category *" value={category} onChangeText={setCategory} placeholder="e.g., Meals & Entertainment" />
        <Input label="Amount *" value={amount} onChangeText={setAmount} placeholder="e.g., 45.00" keyboardType="decimal-pad" />
        <CustomDatePicker label="Date *" date={date} onDateChange={setDate} />
        <Input label="Vendor (Optional)" value={vendor} onChangeText={setVendor} placeholder="e.g., The Cafe" />
        <Input label="Description (Optional)" value={description} onChangeText={setDescription} multiline numberOfLines={3} placeholder="e.g., Client discussion re: Project X" />

        <Button title={isEditing ? 'Save Changes' : 'Record Expense'} onPress={handleSubmit} loading={loading} style={styles.submitButton}/>
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="outline" style={styles.cancelButton}/>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.primary, marginBottom: 20, textAlign: 'center' },
  loadingText: { textAlign: 'center', padding: 20, fontSize: 16 },
  errorText: { color: colors.error, marginBottom: 15, textAlign: 'center', fontSize: 14 },
  submitButton: { marginTop: 20 },
  cancelButton: { marginTop: 10 },
});

export default ExpenseFormScreen; 