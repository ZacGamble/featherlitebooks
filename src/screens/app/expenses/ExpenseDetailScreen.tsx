import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Button from '@/components/common/Button/Button';
import Card from '@/components/common/Card/Card';
import { ExpenseStackParamList } from '@/navigation/AppTabs';
import { ROUTES } from '@/constants/routes';
import { Expense } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { colors } from '@/constants/colors';

type ExpenseDetailScreenProps = NativeStackScreenProps<ExpenseStackParamList, typeof ROUTES.EXPENSE_DETAIL>;

export const ExpenseDetailScreen: React.FC<ExpenseDetailScreenProps> = ({ navigation, route }) => {
  const { expenseId } = route.params;
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useSupabase();

  useEffect(() => {
    fetchExpenseDetails();
  }, [expenseId]);

  const fetchExpenseDetails = async () => {
    setLoading(true);
    // Mock fetch for now
    const MOCK_DETAIL_EXPENSE: Expense = {
        id: expenseId, 
        expense_name: `Expense ${expenseId} Details`, 
        category: 'Mock Category', 
        amount: parseFloat(expenseId) * 25.50, // Example amount
        date: new Date().toISOString(), 
        vendor: 'Mock Vendor Inc.',
        description: 'This is a detailed description for a mock expense item. It could be quite long.'
    };
    setExpense(MOCK_DETAIL_EXPENSE);
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this expense record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => { /* Mock delete */ navigation.goBack(); }, style: 'destructive' },
    ]);
  };

  if (loading && !expense) {
    return <ScreenContainer><Text style={styles.messageText}>Loading expense details...</Text></ScreenContainer>;
  }
  if (error) {
    return <ScreenContainer><Text style={styles.messageText}>Error: {error}</Text></ScreenContainer>;
  }
  if (!expense) {
    return <ScreenContainer><Text style={styles.messageText}>Expense record not found.</Text></ScreenContainer>;
  }

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.detailCard}>
            <Text style={styles.expenseName}>{expense.expense_name}</Text>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={[styles.detailValue, styles.amountValue]}>${expense.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{expense.category}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{new Date(expense.date).toLocaleDateString()}</Text>
            </View>
            {expense.vendor && (
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vendor:</Text>
                    <Text style={styles.detailValue}>{expense.vendor}</Text>
                </View>
            )}
            {expense.description && (
                <View style={styles.descriptionContainer}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.descriptionText}>{expense.description}</Text>
                </View>
            )}
        </Card>

        <Button 
          title="Edit Expense"
          onPress={() => navigation.navigate(ROUTES.EXPENSE_FORM, { expenseId: expense.id })}
          style={styles.actionButton}
        />
        <Button 
          title="Delete Expense"
          onPress={handleDelete}
          variant="danger"
          loading={loading} // For delete action if it were async
          style={styles.actionButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  detailCard: { padding: 20, marginBottom: 20 },
  expenseName: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 15, textAlign: 'center' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  detailLabel: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' },
  detailValue: { fontSize: 16, color: colors.text },
  amountValue: { fontWeight: 'bold', color: colors.accent },
  descriptionContainer: { marginTop: 10, paddingTop: 10, borderTopWidth:1, borderTopColor:colors.lightGray },
  descriptionText: { fontSize: 15, color: colors.text, marginTop: 5, lineHeight:22 },
  actionButton: { marginTop: 10 },
  messageText: { textAlign: 'center', padding: 20, fontSize: 16, color: colors.textSecondary },
});

export default ExpenseDetailScreen; 