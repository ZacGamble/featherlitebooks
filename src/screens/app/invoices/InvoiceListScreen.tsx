import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import ListItem from '@/components/common/ListItem/ListItem';
import Button from '@/components/common/Button/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InvoiceStackParamList } from '@/navigation/InvoiceStack';
import { ROUTES } from '@/constants/routes';
import { Invoice, Client } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as invoiceService from '@/api/invoiceService';
import { format, parseISO } from 'date-fns';

type InvoiceListNavigationProp = NativeStackNavigationProp<InvoiceStackParamList, typeof ROUTES.INVOICE_LIST>;

export const InvoiceListScreen: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuth();
  const navigation = useNavigation<InvoiceListNavigationProp>();

  const fetchInvoices = useCallback(async () => {
    if (!user) {
      setError("User not authenticated. Cannot fetch invoices.");
      setInvoices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await invoiceService.getInvoices(user.id);
      if (fetchError) {
        setError(fetchError.message);
        window.alert(`Error fetching invoices: ${fetchError.message}`);
        setInvoices([]);
      } else if (data) {
        setInvoices(data);
      } else {
        setInvoices([]);
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      window.alert(`An unexpected error occurred: ${err.message}`);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchInvoices();
    }, [fetchInvoices])
  );
  
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (invoice.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Invoice }) => {
    const clientName = item.client?.name || 'N/A';
    const invoiceDate = item.invoice_date ? format(parseISO(item.invoice_date), 'MMM dd, yyyy') : 'N/A';
    
    return (
      <ListItem
        title={`#${item.invoice_number} - ${clientName}`}
        subtitle={`Date: ${invoiceDate} | Status: ${item.status} | Total: $${item.total_amount.toFixed(2)}`}
        onPress={() => navigation.navigate(ROUTES.INVOICE_DETAIL, { invoiceId: item.id })}
        rightIconName="chevron-forward-outline"
      />
    );
  };

  if (loading && invoices.length === 0) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.messageText}>Loading invoices...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.controlsContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by #, client, or status..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray}
        />
      </View>
      
      {error && (
          <View style={styles.inlineErrorView}>
            <Text style={styles.errorText}>Error: {error}. Pull to retry.</Text>
          </View>
      )}

      <FlatList
        data={filteredInvoices}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchInvoices} 
        refreshing={loading}
        ListEmptyComponent={() => (
          !loading && (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="document-text-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyStateText}>{searchQuery ? 'No invoices match your search.' : 'No invoices yet.'}</Text>
              {!searchQuery && <Text style={styles.emptyStateSubText}>Create your first invoice to get started.</Text>}
            </View>
          )
        )}
      />
      <Button
        title="Add New Invoice"
        onPress={() => navigation.navigate(ROUTES.INVOICE_FORM, {})}
        style={styles.addButton}
        iconLeft={<Ionicons name="add-circle-outline" size={20} color={colors.white} />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centerAlign: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  listContent: {
    paddingBottom: 80,
    paddingHorizontal: 10,
  },
  inlineErrorView: {
    backgroundColor: colors.errorBackground,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default InvoiceListScreen; 