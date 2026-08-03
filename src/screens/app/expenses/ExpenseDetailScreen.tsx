import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Button from '@/components/common/Button/Button';
import { ExpenseStackParamList } from '@/navigation/ExpenseStack';
import { ROUTES } from '@/constants/routes';
import { Expense } from '@/types';
import { colors } from '@/constants/colors';
import * as expenseService from '@/api/expenseService';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

type Props = NativeStackScreenProps<ExpenseStackParamList, typeof ROUTES.EXPENSE_DETAIL>;

interface DetailDisplayItemProps {
  label: string;
  value?: string | null | number;
  iconName?: keyof typeof Ionicons.glyphMap;
  isCurrency?: boolean;
  isLink?: boolean;
}

const DetailDisplayItem: React.FC<DetailDisplayItemProps> = ({ label, value, iconName, isCurrency, isLink }) => {
  if (value === null || value === undefined || value === '') return null;
  
  const displayValue = isCurrency && typeof value === 'number' ? `$${value.toFixed(2)}` : value.toString();

  const handlePress = () => {
    if (isLink && typeof value === 'string') {
      Linking.openURL(value).catch(err => Alert.alert('Error', 'Could not open link: ' + err.message));
    }
  };

  return (
    <TouchableOpacity onPress={isLink ? handlePress : undefined} disabled={!isLink} style={styles.detailItemContainer}>
      {iconName && <Ionicons name={iconName} size={20} color={colors.primary} style={styles.detailIcon} />}
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, isLink && styles.linkValue]} selectable>{displayValue}</Text>
      </View>
      {isLink && <Ionicons name="open-outline" size={20} color={colors.primary} style={styles.linkIcon} />}
    </TouchableOpacity>
  );
};

export const ExpenseDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { expenseId } = route.params;
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenseDetails = useCallback(async () => {
    if (!expenseId) {
      setError('Expense ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setActionLoading(false);
    setError(null);
    try {
      const { data, error: fetchError } = await expenseService.getExpenseById(expenseId);
      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setExpense(data);
      } else {
        setError('Expense not found.');
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [expenseId]);

  useFocusEffect(
    useCallback(() => {
      fetchExpenseDetails();
      return () => {};
    }, [fetchExpenseDetails])
  );

  const handleEdit = () => {
    if (expense) {
      navigation.navigate(ROUTES.EXPENSE_FORM, { expenseId: expense.id });
    }
  };

  const handleDelete = async () => {
    if (!expense) return;
    const title = expense.description || expense.name || 'Expense';
    const confirmed = window.confirm(`Are you sure you want to delete the expense: ${title}? This action cannot be undone.`);
    if (confirmed) {
      setActionLoading(true);
      try {
        const { error: deleteError } = await expenseService.deleteExpense(expense.id);
        if (deleteError) {
          setError(deleteError.message);
          window.alert(`Delete Error: ${deleteError.message}`);
        } else {
          window.alert(`Expense "${title}" deleted successfully.`);
          navigation.goBack();
        }
      } catch (e) {
        const err = e as Error;
        setError(err.message);
        window.alert(`Delete Error: An unexpected error occurred: ${err.message}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.messageText}>Loading expense details...</Text>
      </ScreenContainer>
    );
  }

  if (error && !expense) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorMessageText}>{error}</Text>
        <Button title="Retry" onPress={fetchExpenseDetails} style={{marginTop: 10}} />
        <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" style={{marginTop: 10}} />
      </ScreenContainer>
    );
  }

  if (!expense) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.messageText}>Expense not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const dateStr = expense.expense_date || expense.date || new Date().toISOString();

  return (
    <ScreenContainer scrollable>
      <View style={styles.topBarContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Details</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerSection}>
          <Ionicons name="receipt-outline" size={60} color={colors.primary} />
          <Text style={styles.expenseName}>{expense.description || expense.name}</Text>
        </View>

        {error && <Text style={[styles.messageText, styles.inlineError]}>{error}</Text>}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <DetailDisplayItem label="Amount" value={expense.amount} iconName="cash-outline" isCurrency />
          <DetailDisplayItem label="Category" value={expense.category} iconName="pricetag-outline" />
          <DetailDisplayItem label="Date" value={format(parseISO(dateStr), 'MMM dd, yyyy')} iconName="calendar-outline" />
          {(expense.vendor_name || expense.vendor) && <DetailDisplayItem label="Vendor" value={expense.vendor_name || expense.vendor} iconName="storefront-outline" />}
          {expense.receipt_url && <DetailDisplayItem label="Receipt" value={expense.receipt_url} iconName="attach-outline" isLink />}
        </View>
        
        {expense.description && (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Description</Text>
                <Text style={styles.notesText}>{expense.description}</Text>
            </View>
        )}

        <View style={styles.actionsContainer}>
          <Button 
            title="Edit Expense" 
            onPress={handleEdit} 
            style={styles.actionButton} 
            iconLeft={<Ionicons name="pencil-outline" size={18} color={colors.white} />}
            disabled={actionLoading}
          />
          <Button 
            title="Delete Expense" 
            onPress={handleDelete} 
            variant="danger" 
            style={styles.actionButton} 
            iconLeft={<Ionicons name="trash-outline" size={18} color={colors.white} />}
            loading={actionLoading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centerAlign: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  topBarContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingTop: 10, paddingBottom: 5, backgroundColor: colors.surface },
  backButton: { padding: 8, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  container: { paddingTop: 5, paddingBottom: 40, paddingHorizontal: 15 },
  headerSection: { alignItems: 'center', marginBottom: 20, paddingVertical: 15, backgroundColor: colors.surface, borderRadius: 8 },
  expenseName: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 10, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingBottom: 8 }, 
  detailItemContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  detailIcon: { marginRight: 15, marginTop: 3 },
  detailTextContainer: { flex: 1 },
  detailLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 3, textTransform: 'uppercase' },
  detailValue: { fontSize: 16, color: colors.text, lineHeight: 22 },
  linkValue: { color: colors.primary, textDecorationLine: 'underline' },
  linkIcon: { marginLeft: 10, marginTop: 3 },
  notesText: { fontSize: 14, color: colors.text, lineHeight: 20 }, 
  actionsContainer: { marginTop: 10, paddingHorizontal: 5 },
  actionButton: { marginBottom: 12 },
  messageText: { marginTop: 10, fontSize: 16, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
  errorMessageText: { marginTop: 10, fontSize: 16, color: colors.error, textAlign: 'center', paddingHorizontal: 20 },
  inlineError: { color: colors.error, marginBottom: 15, textAlign: 'center' },
});

export default ExpenseDetailScreen; 