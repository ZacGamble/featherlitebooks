import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import ListItem from '@/components/common/ListItem/ListItem';
import Button from '@/components/common/Button/Button';
import { InvoiceStackParamList } from '@/navigation/AppTabs';
import { ROUTES } from '@/constants/routes';
import { Invoice, Client } from '@/types'; // Assuming you have these types
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type InvoiceListScreenProps = NativeStackScreenProps<InvoiceStackParamList, typeof ROUTES.INVOICE_LIST>;

// Mock data for initial display
const MOCK_CLIENTS: { [id: string]: Client } = {
  '1': { id: '1', name: 'Client Alpha' },
  '2': { id: '2', name: 'Client Beta Inc.' },
};

const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-2024-001',
    client_id: '1',
    date: new Date().toISOString(),
    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // Due in 15 days
    line_items: [{ id: 'li1', product_service_description: 'Consulting Hours', quantity: 5, unit_price: 75, total: 375 }],
    subtotal: 375,
    total_amount: 375,
    status: 'sent',
  },
  {
    id: '2',
    invoice_number: 'INV-2024-002',
    client_id: '2',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Due in 5 days
    line_items: [{ id: 'li2', product_service_description: 'Product A', quantity: 2, unit_price: 150, total: 300 }],
    subtotal: 300,
    total_amount: 300,
    status: 'paid',
  },
];

export const InvoiceListScreen: React.FC<InvoiceListScreenProps> = ({ navigation }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const supabase = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    if (!user) {
        setError("User not authenticated");
        setInvoices(MOCK_INVOICES.map(inv => ({...inv, client: MOCK_CLIENTS[inv.client_id]})));
        return;
    }
    setLoading(true);
    setError(null);
    // Actual Supabase fetch would be here, joining with clients table if needed
    // For now, using mock data
    setInvoices(MOCK_INVOICES.map(inv => ({...inv, client: MOCK_CLIENTS[inv.client_id]})));
    setLoading(false);
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (invoice.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Invoice }) => (
    <ListItem
      title={`Invoice ${item.invoice_number}`}
      subtitle={`${item.client?.name || 'N/A'} - Due: ${new Date(item.due_date).toLocaleDateString()} - Status: ${item.status}`}
      onPress={() => navigation.navigate(ROUTES.INVOICE_DETAIL, { invoiceId: item.id })}
      rightIconName="chevron-forward-outline"
    />
  );

  return (
    <ScreenContainer>
      <View style={styles.controlsContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by Inv #, Client, Status..."
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
            <Text style={styles.filterText}>Filter options for invoices (e.g., by status, date range).</Text>
            {/* Add filter components here */}
        </View>
      )}

      {loading && <Text style={styles.loadingText}>Loading invoices...</Text>}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      
      {!loading && !error && filteredInvoices.length === 0 && (
        <Text style={styles.emptyText}>No invoices found. Create one!</Text>
      )}

      <FlatList
        data={filteredInvoices}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchInvoices}
        refreshing={loading}
      />
      <Button
        title="Create New Invoice"
        onPress={() => navigation.navigate(ROUTES.INVOICE_FORM, {})}
        style={styles.addButton}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButton: {
    padding: 8,
  },
  filterPanel: {
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 70,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: colors.textSecondary,
  },
  errorText: {
    textAlign: 'center',
    padding: 20,
    color: colors.error,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: colors.textSecondary,
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default InvoiceListScreen; 