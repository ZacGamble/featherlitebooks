import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import ListItem from '@/components/common/ListItem/ListItem';
import Button from '@/components/common/Button/Button';
import { ExpenseStackParamList } from '@/navigation/AppTabs';
import { ROUTES } from '@/constants/routes';
import { Expense } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type ExpenseListScreenProps = NativeStackScreenProps<ExpenseStackParamList, typeof ROUTES.EXPENSE_LIST>;

const MOCK_EXPENSES: Expense[] = [
  { id: '1', expense_name: 'Office Supplies', category: 'Office', amount: 75.50, date: new Date().toISOString(), vendor: 'Staples' },
  { id: '2', expense_name: 'Software Subscription', category: 'Software', amount: 29.99, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), vendor: 'SaaS Co.' },
  { id: '3', expense_name: 'Travel - Client Meeting', category: 'Travel', amount: 150.00, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), vendor: 'Airline X' },
];

export const ExpenseListScreen: React.FC<ExpenseListScreenProps> = ({ navigation }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const supabase = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    if (!user) {
        setError("User not authenticated");
        setExpenses(MOCK_EXPENSES);
        return;
    }
    setLoading(true);
    setError(null);
    // Actual Supabase fetch would be here
    setExpenses(MOCK_EXPENSES);
    setLoading(false);
  };

  const filteredExpenses = expenses.filter(expense => 
    expense.expense_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (expense.vendor || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Expense }) => (
    <ListItem
      title={item.expense_name}
      subtitle={`${item.category} - ${item.vendor || 'N/A'} - ${new Date(item.date).toLocaleDateString()}`}
      onPress={() => navigation.navigate(ROUTES.EXPENSE_DETAIL, { expenseId: item.id })}
      rightIconName="chevron-forward-outline"
    >
        <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
    </ListItem>
  );

  return (
    <ScreenContainer>
      <View style={styles.controlsContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by Name, Category, Vendor..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray}
        />
        <TouchableOpacity onPress={() => setFilterVisible(!filterVisible)} style={styles.iconButton}>
            <Ionicons name="filter-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {filterVisible && (
        <View style={styles.filterPanel}>
            <Text style={styles.filterText}>Filter options for expenses (e.g., by category, date range).</Text>
        </View>
      )}

      {loading && <Text style={styles.loadingText}>Loading expenses...</Text>}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      
      {!loading && !error && filteredExpenses.length === 0 && (
        <Text style={styles.emptyText}>No expenses found. Add one!</Text>
      )}

      <FlatList
        data={filteredExpenses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchExpenses}
        refreshing={loading}
      />
      <Button
        title="Record New Expense"
        onPress={() => navigation.navigate(ROUTES.EXPENSE_FORM, {})}
        style={styles.addButton}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  controlsContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, marginBottom: 10 },
  searchInput: { flex: 1, height: 40, backgroundColor: colors.lightGray, borderRadius: 8, paddingHorizontal: 10, marginRight: 10, fontSize: 16, borderWidth:1, borderColor:colors.border },
  iconButton: { padding: 8 },
  filterPanel: { padding: 15, backgroundColor: colors.surface, borderRadius: 8, marginBottom: 10, borderWidth:1, borderColor:colors.border },
  filterText: { color: colors.textSecondary, textAlign: 'center' },
  listContent: { paddingBottom: 70 },
  loadingText: { textAlign: 'center', padding: 20, color: colors.textSecondary },
  errorText: { textAlign: 'center', padding: 20, color: colors.error },
  emptyText: { textAlign: 'center', padding: 20, color: colors.textSecondary, fontSize: 16 },
  addButton: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  amountText: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginLeft: 'auto' },
});

export default ExpenseListScreen; 