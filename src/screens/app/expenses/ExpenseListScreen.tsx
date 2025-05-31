import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Button from '@/components/common/Button/Button';
import ListItem from '@/components/common/ListItem/ListItem';
import { Expense } from '@/types';
import { ExpenseStackParamList } from '@/navigation/ExpenseStack';
import { ROUTES } from '@/constants/routes';
import { colors } from '@/constants/colors';
import * as expenseService from '@/api/expenseService';
import { useAuth } from '@/auth/AuthContext';
import { format, parseISO } from 'date-fns';

type Props = NativeStackScreenProps<ExpenseStackParamList, typeof ROUTES.EXPENSE_LIST>;

export const ExpenseListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setError('User not authenticated.');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setError(null);
    try {
      const { data, error: fetchError } = await expenseService.getExpenses(user.id);
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setExpenses(data || []);
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchExpenses();
    }, [fetchExpenses])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.vendor && expense.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderItem = ({ item }: { item: Expense }) => (
    <ListItem
      title={item.name}
      subtitle={`${item.category} - ${format(parseISO(item.expense_date), 'MMM dd, yyyy')}`}
      onPress={() => navigation.navigate(ROUTES.EXPENSE_DETAIL, { expenseId: item.id })}
      leftIconName="receipt-outline"
    >
      <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
    </ListItem>
  );

  if (loading && !refreshing) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.messageText}>Loading expenses...</Text>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorMessageText}>{error}</Text>
        <Button title="Retry" onPress={fetchExpenses} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Expenses</Text>
        <Button
          title="New Expense"
          onPress={() => navigation.navigate(ROUTES.EXPENSE_FORM, {})}
          iconLeft={<Ionicons name="add-circle-outline" size={20} color={colors.white} />}
          size="small"
        />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses (name, category, vendor...)"
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor={colors.textSecondary}
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearSearchButton}>
            <Ionicons name="close-circle-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {filteredExpenses.length === 0 && !loading ? (
        <View style={styles.centerAlignContent}>
            <Ionicons name="documents-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyMessage}>No expenses found.</Text>
            <Text style={styles.emptySubMessage}>
                {searchTerm ? 'Try a different search term.' : 'Tap "New Expense" to get started.'}
            </Text>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centerAlign: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerAlignContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  messageText: { marginTop: 10, fontSize: 16, color: colors.textSecondary },
  errorMessageText: { marginTop: 10, fontSize: 16, color: colors.error, textAlign: 'center' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.text,
  },
  clearSearchButton: { padding: 5 },
  listContentContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  emptyMessage: { fontSize: 18, color: colors.textSecondary, marginTop: 15, textAlign: 'center' },
  emptySubMessage: { fontSize: 14, color: colors.TEXT_TERTIARY, marginTop: 5, textAlign: 'center' },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 'auto',
  },
});

export default ExpenseListScreen; 