import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Button from '@/components/common/Button/Button';
import Card from '@/components/common/Card/Card';
import { InvoiceStackParamList } from '@/navigation/AppTabs';
import { ROUTES } from '@/constants/routes';
import { Invoice, InvoiceLineItem, Client } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { colors } from '@/constants/colors';

type InvoiceDetailScreenProps = NativeStackScreenProps<InvoiceStackParamList, typeof ROUTES.INVOICE_DETAIL>;

// Mock client data for detail view
const MOCK_CLIENT_DETAIL: Client = { id: '1', name: 'Client Alpha Deluxe', email: 'alpha@example.com', phone: '555-1234' };

// Helper function for status color
const getStatusColor = (status: Invoice['status']) => {
  if (status === 'paid') return colors.success;
  if (status === 'overdue') return colors.error; // Assuming 'overdue' is a possible status
  return colors.textSecondary;
};

export const InvoiceDetailScreen: React.FC<InvoiceDetailScreenProps> = ({ navigation, route }) => {
  const { invoiceId } = route.params;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useSupabase();

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    setError(null);
    // Mock fetch, join with client for display
    const MOCK_DETAIL_INVOICE: Invoice = {
      id: invoiceId,
      invoice_number: `INV-2024-${invoiceId.padStart(3, '0')}`,
      client_id: '1',
      client: MOCK_CLIENT_DETAIL,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      line_items: [
        { id: 'li_detail_1', product_service_description: 'Detailed Service A', quantity: 2, unit_price: 75, total: 150 },
        { id: 'li_detail_2', product_service_description: 'Product B (Detailed)', quantity: 1, unit_price: 120, total: 120 },
      ],
      subtotal: 270,
      tax_amount: 27, // Example tax
      total_amount: 297,
      status: Math.random() > 0.5 ? 'paid' : 'sent',
      notes: 'This is a detailed mock invoice with some notes for display purposes.',
    };
    setInvoice(MOCK_DETAIL_INVOICE);
    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this invoice?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => { /* Mock delete */ navigation.goBack(); }, style: 'destructive' },
    ]);
  };
  
  const handleMarkAsPaid = () => {
    Alert.alert('Mark as Paid', 'Mark this invoice as paid?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark Paid', onPress: () => { 
            setInvoice(prev => prev ? ({...prev, status: 'paid'}) : null);
            Alert.alert('Success', 'Invoice marked as paid.');
         } },
      ]);
  };

  if (loading && !invoice) {
    return <ScreenContainer><Text style={styles.messageText}>Loading invoice details...</Text></ScreenContainer>;
  }
  if (error) {
    return <ScreenContainer><Text style={styles.messageText}>Error: {error}</Text></ScreenContainer>;
  }
  if (!invoice) {
    return <ScreenContainer><Text style={styles.messageText}>Invoice not found.</Text></ScreenContainer>;
  }

  const renderLineItem = ({ item }: { item: InvoiceLineItem }) => (
    <View style={styles.lineItemRow}>
      <Text style={styles.lineItemDescription}>{item.product_service_description}</Text>
      <Text style={styles.lineItemQty}>{item.quantity}</Text>
      <Text style={styles.lineItemPrice}>${item.unit_price.toFixed(2)}</Text>
      <Text style={styles.lineItemTotal}>${item.total.toFixed(2)}</Text>
    </View>
  );

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.headerCard}>
          <Text style={styles.invoiceNumber}>Invoice {invoice.invoice_number}</Text>
          <Text style={[styles.statusTextBase, { color: getStatusColor(invoice.status) }]}>STATUS: {invoice.status.toUpperCase()}</Text>
          {invoice.client && (
            <View style={styles.clientInfoContainer}>
              <Text style={styles.clientName}>{invoice.client.name}</Text>
              {invoice.client.email && <Text style={styles.clientContact}>{invoice.client.email}</Text>}
              {invoice.client.phone && <Text style={styles.clientContact}>{invoice.client.phone}</Text>}
            </View>
          )}
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Date Issued:</Text>
            <Text style={styles.dateValue}>{new Date(invoice.date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Due Date:</Text>
            <Text style={styles.dateValue}>{new Date(invoice.due_date).toLocaleDateString()}</Text>
          </View>
        </Card>

        <Card style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          <View style={styles.lineItemHeaderRow}>
            <Text style={[styles.lineItemHeaderText, styles.lineItemDescription]}>Description</Text>
            <Text style={[styles.lineItemHeaderText, styles.lineItemQty]}>Qty</Text>
            <Text style={[styles.lineItemHeaderText, styles.lineItemPrice]}>Price</Text>
            <Text style={[styles.lineItemHeaderText, styles.lineItemTotal]}>Total</Text>
          </View>
          <FlatList
            data={invoice.line_items}
            renderItem={renderLineItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // If inside ScrollView, disable this FlatList's scroll
          />
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}><Text>Subtotal:</Text><Text>${invoice.subtotal.toFixed(2)}</Text></View>
          {invoice.tax_amount && <View style={styles.summaryRow}><Text>Tax:</Text><Text>${invoice.tax_amount.toFixed(2)}</Text></View>}
          {invoice.discount_amount && <View style={styles.summaryRow}><Text>Discount:</Text><Text>-${invoice.discount_amount.toFixed(2)}</Text></View>}
          <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalText}>Total Amount:</Text><Text style={styles.totalText}>${invoice.total_amount.toFixed(2)}</Text></View>
        </Card>

        {invoice.notes && (
          <Card style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </Card>
        )}

        <View style={styles.actionsContainer}>
          <Button title="Edit Invoice" onPress={() => navigation.navigate(ROUTES.INVOICE_FORM, { invoiceId: invoice.id })} style={styles.actionButton}/>
          {invoice.status !== 'paid' && <Button title="Mark as Paid" onPress={handleMarkAsPaid} variant='secondary' style={styles.actionButton}/>}
          <Button title="Delete Invoice" onPress={handleDelete} variant="danger" style={styles.actionButton}/>
          {/* Add Send Email / Download PDF buttons here */}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, paddingBottom: 20 },
  headerCard: { marginBottom: 15, padding:15 },
  invoiceNumber: { fontSize: 22, fontWeight: 'bold', color: colors.primary, marginBottom: 5, textAlign: 'center' },
  statusTextBase: { // Renamed from statusText and made a plain object
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 15,
  },
  clientInfoContainer: { marginBottom:10, alignItems:'center'},
  clientName: { fontSize:18, fontWeight:'500', marginBottom:3},
  clientContact: { fontSize:14, color: colors.textSecondary},
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  dateLabel: { fontSize: 14, color: colors.textSecondary },
  dateValue: { fontSize: 14, fontWeight: '500' },
  
  itemsCard: { marginBottom: 15, padding:15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  lineItemHeaderRow: { flexDirection: 'row', borderBottomWidth:1, borderBottomColor:colors.border, paddingBottom:5, marginBottom:5},
  lineItemRow: { flexDirection: 'row', paddingVertical: 5 },
  lineItemHeaderText: {fontWeight:'bold', color:colors.textSecondary},
  lineItemDescription: { flex: 3, fontSize: 14 },
  lineItemQty: { flex: 0.7, textAlign: 'right', fontSize: 14, marginRight:5 },
  lineItemPrice: { flex: 1, textAlign: 'right', fontSize: 14, marginRight:5 },
  lineItemTotal: { flex: 1, textAlign: 'right', fontWeight: 'bold', fontSize: 14 },

  summaryCard: { marginBottom: 15, padding:15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalRow: { borderTopWidth:1, borderTopColor:colors.border, paddingTop:8, marginTop:5},
  totalText: { fontWeight:'bold', fontSize:16},
  
  notesCard: { marginBottom: 15, padding:15 },
  
  actionsContainer: { marginTop:10 },
  actionButton: { marginBottom: 10 },
  messageText: { textAlign: 'center', padding: 20, fontSize: 16, color: colors.textSecondary },
});

export default InvoiceDetailScreen; 