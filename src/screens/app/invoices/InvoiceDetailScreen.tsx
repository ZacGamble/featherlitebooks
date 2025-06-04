import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Button from '@/components/common/Button/Button';
import { InvoiceStackParamList } from '@/navigation/InvoiceStack';
import { ROUTES } from '@/constants/routes';
import { Invoice, InvoiceLineItem, Client } from '@/types';
import { colors } from '@/constants/colors';
import * as invoiceService from '@/api/invoiceService';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';

type Props = NativeStackScreenProps<InvoiceStackParamList, typeof ROUTES.INVOICE_DETAIL>;

interface DetailDisplayItemProps {
  label: string;
  value?: string | null | number;
  iconName?: keyof typeof Ionicons.glyphMap;
  isCurrency?: boolean;
}

const DetailDisplayItem: React.FC<DetailDisplayItemProps> = ({ label, value, iconName, isCurrency }) => {
  if (value === null || value === undefined || value === '') return null;
  const displayValue = isCurrency && typeof value === 'number' ? `$${value.toFixed(2)}` : value.toString();
  return (
    <View style={styles.detailItemContainer}>
      {iconName && <Ionicons name={iconName} size={20} color={colors.primary} style={styles.detailIcon} />}
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} selectable>{displayValue}</Text>
      </View>
    </View>
  );
};

export const InvoiceDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { invoiceId } = route.params;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoiceDetails = useCallback(async () => {
    if (!invoiceId) {
      setError('Invoice ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setActionLoading(false);
    setError(null);
    try {
      const { data, error: fetchError } = await invoiceService.getInvoiceById(invoiceId);
      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setInvoice(data);
      } else {
        setError('Invoice not found.');
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useFocusEffect(
    useCallback(() => {
      fetchInvoiceDetails();
      return () => {};
    }, [fetchInvoiceDetails])
  );

  const handleEdit = () => {
    if (invoice) {
      navigation.navigate(ROUTES.INVOICE_FORM, { invoiceId: invoice.id });
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    const confirmed = window.confirm(`Are you sure you want to delete Invoice #${invoice.invoice_number}? This action cannot be undone.`);
    if (confirmed) {
      setActionLoading(true);
      try {
        const { error: deleteError } = await invoiceService.deleteInvoice(invoice.id);
        if (deleteError) {
          setError(deleteError.message);
          window.alert(`Delete Error: ${deleteError.message}`);
        } else {
          window.alert(`Invoice #${invoice.invoice_number} deleted successfully.`);
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
        <Text style={styles.messageText}>Loading invoice details...</Text>
      </ScreenContainer>
    );
  }

  if (error && !invoice) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorMessageText}>{error}</Text>
        <Button title="Retry" onPress={fetchInvoiceDetails} style={{marginTop: 10}} />
        <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" style={{marginTop: 10}} />
      </ScreenContainer>
    );
  }

  if (!invoice) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.messageText}>Invoice not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const { client, line_items = [] } = invoice;
  const discountDisplay = invoice.discount_amount ?? 0;
  const taxDisplay = invoice.tax_amount ?? 0;

  return (
    <ScreenContainer scrollable>
      <View style={styles.topBarContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Details</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerSection}>
          <Ionicons name="document-text-outline" size={60} color={colors.primary} />
          <Text style={styles.invoiceNumber}>Invoice #{invoice.invoice_number}</Text>
          <Text style={styles.invoiceStatus}>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</Text>
        </View>

        {error && <Text style={[styles.messageText, styles.inlineError]}>{error}</Text>}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client Information</Text>
          {client ? (
            <>
              <DetailDisplayItem label="Client Name" value={client.name} iconName="person-outline" />
              <DetailDisplayItem label="Email" value={client.email} iconName="mail-outline" />
              <DetailDisplayItem label="Phone" value={client.phone} iconName="call-outline" />
              <DetailDisplayItem label="Address" value={`${client.address_line1 || ''}${client.address_line2 ? ', ' + client.address_line2 : ''}, ${client.city || ''}, ${client.state_province || ''} ${client.postal_code || ''}`} iconName="location-outline" />
            </>
          ) : <Text style={styles.infoText}>Client details not available.</Text>}
        </View>

        <View style={styles.card}>
            <Text style={styles.cardTitle}>Invoice Dates & Terms</Text>
            <DetailDisplayItem label="Invoice Date" value={format(parseISO(invoice.invoice_date), 'MMM dd, yyyy')} iconName="calendar-outline" />
            <DetailDisplayItem label="Due Date" value={format(parseISO(invoice.due_date), 'MMM dd, yyyy')} iconName="time-outline" />
            {invoice.category && <DetailDisplayItem label="Category" value={invoice.category} iconName="pricetag-outline" />}
            {invoice.payment_terms && <DetailDisplayItem label="Payment Terms" value={invoice.payment_terms} iconName="reader-outline" />}
        </View>

        <View style={styles.card}>
            <Text style={styles.cardTitle}>Line Items</Text>
            {line_items.length > 0 ? (
                <FlatList
                    data={line_items}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.lineItemContainer}>
                            <Text style={styles.lineItemDescription}>{item.description}</Text>
                            <Text style={styles.lineItemDetails}>Qty: {item.quantity} @ ${item.unit_price.toFixed(2)}</Text>
                            <Text style={styles.lineItemTotal}>Line Total: ${item.line_total.toFixed(2)}</Text>
                        </View>
                    )}
                    scrollEnabled={false}
                />
            ) : (
                <Text style={styles.infoText}>No line items for this invoice.</Text>
            )}
        </View>

        <View style={styles.card}>
            <Text style={styles.cardTitle}>Summary</Text>
            <DetailDisplayItem label="Subtotal" value={invoice.subtotal} iconName="calculator-outline" isCurrency />
            {discountDisplay > 0 && 
              <DetailDisplayItem label="Discount" value={discountDisplay} iconName="remove-circle-outline" isCurrency />}
            {taxDisplay > 0 && 
              <DetailDisplayItem label="Tax" value={taxDisplay} iconName="receipt-outline" isCurrency />}
            <View style={[styles.detailItemContainer, styles.totalRow]}>
                <Ionicons name="cash-outline" size={20} color={colors.primary} style={styles.detailIcon} />
                <View style={styles.detailTextContainer}>
                    <Text style={[styles.detailLabel, styles.totalLabel]}>Total Amount</Text>
                    <Text style={[styles.detailValue, styles.totalValue]} selectable>${invoice.total_amount.toFixed(2)}</Text>
                </View>
            </View>
        </View>
        
        {invoice.notes && (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Notes</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
        )}

        <View style={styles.actionsContainer}>
          <Button 
            title="Edit Invoice" 
            onPress={handleEdit} 
            style={styles.actionButton} 
            iconLeft={<Ionicons name="pencil-outline" size={18} color={colors.white} />}
            disabled={actionLoading}
          />
          <Button 
            title="Delete Invoice" 
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
  invoiceNumber: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginTop: 10, textAlign: 'center' },
  invoiceStatus: { fontSize: 16, color: colors.primary, textTransform: 'capitalize', marginTop: 4, fontWeight: '500' },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingBottom: 8 }, 
  detailItemContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  detailIcon: { marginRight: 15, marginTop: 3 },
  detailTextContainer: { flex: 1 },
  detailLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 3, textTransform: 'uppercase' },
  detailValue: { fontSize: 16, color: colors.text, lineHeight: 22 },
  totalRow: { borderBottomWidth: 0, marginTop: 5 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
  lineItemContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  lineItemDescription: { fontSize: 15, fontWeight: '500', color: colors.text, marginBottom: 4 },
  lineItemDetails: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  lineItemTotal: { fontSize: 14, fontWeight: 'bold', color: colors.primary, textAlign: 'right' },
  infoText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingVertical: 15 },
  notesText: { fontSize: 14, color: colors.text, lineHeight: 20 }, 
  actionsContainer: { marginTop: 10, paddingHorizontal: 5 },
  actionButton: { marginBottom: 12 },
  messageText: { marginTop: 10, fontSize: 16, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
  errorMessageText: { marginTop: 10, fontSize: 16, color: colors.error, textAlign: 'center', paddingHorizontal: 20 },
  inlineError: { color: colors.error, marginBottom: 15, textAlign: 'center' },
});

export default InvoiceDetailScreen; 