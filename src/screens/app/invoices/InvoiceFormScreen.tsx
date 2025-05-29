import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import CustomDatePicker from '@/components/forms/DatePicker'; // Placeholder, needs implementation
import ListItem from '@/components/common/ListItem/ListItem'; // For client selection
import { InvoiceStackParamList } from '@/navigation/AppTabs';
import { ROUTES } from '@/constants/routes';
import { Invoice, InvoiceLineItem, Client, SelectableItem } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type InvoiceFormScreenProps = NativeStackScreenProps<InvoiceStackParamList, typeof ROUTES.INVOICE_FORM>;

// Mock data for clients
const MOCK_CLIENT_LIST: SelectableItem<string>[] = [
  { label: 'Client Alpha', value: '1' },
  { label: 'Client Beta Inc.', value: '2' },
  { label: 'Client Gamma LLC', value: '3' },
];

export const InvoiceFormScreen: React.FC<InvoiceFormScreenProps> = ({ navigation, route }) => {
  const invoiceId = route.params?.invoiceId;
  const isEditing = !!invoiceId;

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [selectedClientName, setSelectedClientName] = useState('Select Client');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Default 30 days
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [status, setStatus] = useState<'draft' | 'sent' | 'paid'>('draft');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [clientModalVisible, setClientModalVisible] = useState(false); // For client selection UI

  const supabase = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    // Generate a unique invoice number for new invoices (placeholder logic)
    if (!isEditing) {
      setInvoiceNumber(`INV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`);
    }
    // If editing, fetch invoice details
    if (isEditing && invoiceId) {
      fetchInvoiceDetails(invoiceId);
    }
  }, [invoiceId, isEditing]);

  const fetchInvoiceDetails = async (id: string) => {
    setLoading(true);
    // Mock fetch, replace with Supabase call
    const MOCK_EDIT_INVOICE: Invoice = {
        id: '1', invoice_number: 'INV-2024-001', client_id: '1', 
        date: new Date().toISOString(), due_date: new Date().toISOString(), 
        line_items: [{id: 'li1', product_service_description: 'Old Item', quantity: 1, unit_price: 10, total: 10}], 
        subtotal: 10, total_amount: 10, status: 'draft'
    };
    if (id === '1') {
        setInvoiceNumber(MOCK_EDIT_INVOICE.invoice_number);
        setClientId(MOCK_EDIT_INVOICE.client_id);
        setSelectedClientName(MOCK_CLIENT_LIST.find(c => c.value === MOCK_EDIT_INVOICE.client_id)?.label || 'Select Client');
        setDate(new Date(MOCK_EDIT_INVOICE.date));
        setDueDate(new Date(MOCK_EDIT_INVOICE.due_date));
        setLineItems(MOCK_EDIT_INVOICE.line_items);
        setStatus(MOCK_EDIT_INVOICE.status as 'draft' | 'sent' | 'paid');
        setNotes(MOCK_EDIT_INVOICE.notes || '');
    } else {
        setFormError('Invoice not found.');
    }
    setLoading(false);
  };
  
  const handleAddLineItem = () => {
    const newLineItem: InvoiceLineItem = {
      id: `temp-${Math.random().toString(36).substr(2, 9)}`, // Temporary ID
      product_service_description: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
    };
    setLineItems([...lineItems, newLineItem]);
  };

  const handleRemoveLineItem = (tempId: string) => {
    setLineItems(lineItems.filter(item => item.id !== tempId));
  };

  const handleLineItemChange = (tempId: string, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === tempId) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total = (Number(updatedItem.quantity) || 0) * (Number(updatedItem.unit_price) || 0);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    // Add tax/discount logic here if needed
    return { subtotal, total_amount: subtotal };
  };
  const { subtotal, total_amount } = calculateTotals();

  const handleSubmit = async () => {
    if (!clientId || lineItems.length === 0) {
      setFormError('Please select a client and add at least one line item.');
      return;
    }
     if (!user) {
        setFormError('User not authenticated. Cannot save invoice.');
        return;
    }

    setLoading(true);
    const invoiceData = {
      invoice_number: invoiceNumber,
      client_id: clientId,
      date: date?.toISOString(),
      due_date: dueDate?.toISOString(),
      line_items: lineItems.map(({id, ...rest}) => rest), // Remove temp id for DB save
      subtotal,
      total_amount,
      status,
      notes,
      user_id: user.id,
    };

    // Mock Submit
    Alert.alert('Mock Submit', `Invoice ${isEditing ? 'updated' : 'created'}: ${invoiceNumber}`);
    setLoading(false);
    navigation.goBack();
  };

  const renderLineItem = ({ item, index }: { item: InvoiceLineItem, index: number }) => (
    <View style={styles.lineItemContainer}>
      <Input 
        placeholder="Item/Service Description" 
        value={item.product_service_description} 
        onChangeText={(text) => handleLineItemChange(item.id, 'product_service_description', text)} 
        containerStyle={styles.lineItemInputDesc}
      />
      <View style={styles.lineItemQtyPrice}>
        <Input 
            placeholder="Qty" 
            value={item.quantity.toString()} 
            onChangeText={(text) => handleLineItemChange(item.id, 'quantity', Number(text))}
            keyboardType="numeric" 
            containerStyle={styles.lineItemInputQty}
        />
        <Input 
            placeholder="Price" 
            value={item.unit_price.toString()} 
            onChangeText={(text) => handleLineItemChange(item.id, 'unit_price', Number(text))} 
            keyboardType="decimal-pad"
            containerStyle={styles.lineItemInputPrice}
        />
        <Text style={styles.lineItemTotal}>${item.total.toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveLineItem(item.id)} style={styles.removeLineItemButton}>
        <Ionicons name="trash-bin-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  // Basic Modal for Client Selection (Replace with a proper modal component)
  if (clientModalVisible) {
    return (
        <ScreenContainer style={{padding: 0}}> 
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Select Client</Text>
                <FlatList 
                    data={MOCK_CLIENT_LIST}
                    keyExtractor={(c) => c.value}
                    renderItem={({item: clientItem}) => (
                        <ListItem 
                            title={clientItem.label} 
                            onPress={() => {
                                setClientId(clientItem.value);
                                setSelectedClientName(clientItem.label);
                                setClientModalVisible(false);
                            }}
                        />
                    )}
                />
                <Button title="Cancel" onPress={() => setClientModalVisible(false)} variant="outline"/>
            </View>
        </ScreenContainer>
    )
  }

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</Text>
        {formError && <Text style={styles.errorText}>{formError}</Text>}

        <Input label="Invoice Number" value={invoiceNumber} onChangeText={setInvoiceNumber} editable={!isEditing} />
        
        <Text style={styles.label}>Client *</Text>
        <TouchableOpacity onPress={() => setClientModalVisible(true)} style={styles.selectButton}>
            <Text style={styles.selectButtonText}>{selectedClientName}</Text>
            <Ionicons name="chevron-down-outline" size={20} color={colors.primary} />
        </TouchableOpacity>

        <CustomDatePicker label="Invoice Date" date={date} onDateChange={setDate} />
        <CustomDatePicker label="Due Date" date={dueDate} onDateChange={setDueDate} />

        <Text style={styles.sectionTitle}>Line Items</Text>
        {lineItems.map((item, index) => renderLineItem({ item, index }))}
        <Button title="Add Line Item" onPress={handleAddLineItem} variant="outline" style={styles.addLineButton} iconLeft={<Ionicons name="add-circle-outline" size={20} color={colors.primary}/>} />

        <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>Subtotal: ${subtotal.toFixed(2)}</Text>
            <Text style={styles.summaryTextBold}>Total: ${total_amount.toFixed(2)}</Text>
        </View>
        
        <Input label="Notes (Optional)" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
        {/* Status Picker placeholder */}
        {/* <Text style={styles.label}>Status</Text> */}
        {/* Implement a Picker for status: draft, sent, paid */}

        <Button title={isEditing ? 'Save Changes' : 'Create Invoice'} onPress={handleSubmit} loading={loading} style={styles.submitButton}/>
        <Button title="Cancel" onPress={() => navigation.goBack()} variant="outline" style={styles.cancelButton}/>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, paddingBottom: 50 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.primary, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, color: colors.textSecondary, marginBottom: 5, marginTop:10 },
  selectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: colors.lightGray, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 15 },
  selectButtonText: { fontSize: 16, color: colors.text },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 20, marginBottom: 10 },
  lineItemContainer: { marginBottom: 10, padding:10, borderWidth:1, borderColor:colors.lightGray, borderRadius: 5, backgroundColor: colors.surface },
  lineItemInputDesc: { marginBottom: 0 },
  lineItemQtyPrice: {flexDirection: 'row', alignItems:'center', justifyContent:'space-between', marginTop:5},
  lineItemInputQty: { flex:1, marginRight:5, marginBottom:0 },
  lineItemInputPrice: { flex:1, marginLeft:5, marginRight:10, marginBottom:0 },
  lineItemTotal: { fontSize: 16, fontWeight: '500'},
  removeLineItemButton: { position: 'absolute', top: 5, right: 5, padding:5 },
  addLineButton: { marginTop: 10, marginBottom:20, borderColor:colors.primary },
  summaryContainer: { marginTop: 20, marginBottom: 20, padding: 15, backgroundColor: colors.lightGray, borderRadius: 8 },
  summaryText: { fontSize: 16, color: colors.textSecondary, marginBottom: 5 },
  summaryTextBold: { fontSize: 18, color: colors.text, fontWeight: 'bold' }, 
  errorText: { color: colors.error, marginBottom: 15, textAlign: 'center' },
  submitButton: { marginTop: 20 },
  cancelButton: { marginTop: 10 },
  modalContainer: { flex: 1, padding: 20, backgroundColor: colors.background },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
});

export default InvoiceFormScreen; 