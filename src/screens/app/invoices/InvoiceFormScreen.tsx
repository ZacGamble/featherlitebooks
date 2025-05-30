import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InvoiceStackParamList } from '@/navigation/InvoiceStack';
import { ROUTES } from '@/constants/routes';
import { Invoice, InvoiceLineItem, Client, InvoiceStatus, InventoryItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import * as invoiceService from '@/api/invoiceService';
import * as clientService from '@/api/clientService';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/config/supabase';

const INVOICE_STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'void'];

type Props = NativeStackScreenProps<InvoiceStackParamList, typeof ROUTES.INVOICE_FORM>;

export const InvoiceFormScreen: React.FC<Props> = ({ navigation, route }) => {
    const invoiceId = route.params?.invoiceId;
    const isEditing = !!invoiceId;
    const { user } = useAuth();

    const [clientId, setClientId] = useState<string | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState<InvoiceStatus>('draft');
    const [category, setCategory] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('');
    const [lineItems, setLineItems] = useState<Partial<InvoiceLineItem>[]>([]);
    const [subtotal, setSubtotal] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [taxAmount, setTaxAmount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        const fetchClientsList = async () => {
            if (!user) return;
            try {
                const { data, error } = await clientService.getClients(user.id);
                if (error) {
                    setFormError(prev => prev ? `${prev}\nError fetching clients: ${error.message}` : `Error fetching clients: ${error.message}`);
                } else if (data) {
                    setClients(data);
                }
            } catch (e) {
                const err = e as Error;
                setFormError(prev => prev ? `${prev}\nError fetching clients: ${err.message}` : `Error fetching clients: ${err.message}`);
            }
        };
        fetchClientsList();
    }, [user]);

    useEffect(() => {
        if (isEditing && invoiceId && user) {
            setLoading(true);
            const fetchInvoiceData = async () => {
                try {
                    const { data, error } = await invoiceService.getInvoiceById(invoiceId);
                    if (error) {
                        setFormError(`Error fetching invoice: ${error.message}`);
                    } else if (data) {
                        setClientId(data.client_id);
                        setInvoiceNumber(data.invoice_number);
                        setInvoiceDate(data.invoice_date); // Use directly
                        setDueDate(data.due_date);       // Use directly
                        setStatus(data.status);
                        setCategory(data.category || '');
                        setSubtotal(data.subtotal);
                        setDiscountAmount(data.discount_amount || 0);
                        setTaxAmount(data.tax_amount || 0);
                        setTotalAmount(data.total_amount);
                        setNotes(data.notes || '');
                        setPaymentTerms(data.payment_terms || '');
                        setLineItems((data.line_items || []).map(li => ({ ...li })));
                    }
                } catch (e) {
                    const err = e as Error;
                    setFormError(`Failed to load invoice: ${err.message}`);
                }
                setLoading(false);
            };
            fetchInvoiceData();
        }
    }, [invoiceId, isEditing, user]);

    useEffect(() => {
        let currentSubtotal = 0;
        lineItems.forEach(item => {
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.unit_price) || 0;
            currentSubtotal += quantity * unitPrice;
        });
        setSubtotal(currentSubtotal);
        const currentDiscount = Number(discountAmount) || 0;
        const currentTax = Number(taxAmount) || 0;
        const totalAfterDiscount = currentSubtotal - currentDiscount;
        setTotalAmount(totalAfterDiscount + currentTax);
    }, [lineItems, discountAmount, taxAmount]);

    const handleAddLineItem = () => {
        setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
    };

    const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
        const updatedLineItems = lineItems.map((item, i) => {
            if (i === index) {
                const newItem = { ...item, [field]: value };
                if (field === 'quantity' || field === 'unit_price') {
                    const quantity = Number(newItem.quantity) || 0;
                    const unitPrice = Number(newItem.unit_price) || 0;
                    newItem.line_total = quantity * unitPrice;
                }
                return newItem;
            }
            return item;
        });
        setLineItems(updatedLineItems);
    };

    const handleRemoveLineItem = (index: number) => {
        setLineItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!user) { Alert.alert('Error', 'User not authenticated.'); return; }
        if (!clientId) { Alert.alert('Validation Error', 'Please select a client.'); return; }
        if (!invoiceNumber.trim()) { Alert.alert('Validation Error', 'Invoice number is required.'); return; }
        if (!invoiceDate.trim() || !dueDate.trim()) { Alert.alert('Validation Error', 'Invoice date and due date are required.'); return; }

        setLoading(true);
        setFormError(null);

        const invoiceCoreData: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'client' | 'line_items'> = {
            user_id: user.id,
            client_id: clientId,
            invoice_number: invoiceNumber.trim(),
            invoice_date: invoiceDate,
            due_date: dueDate,
            status,
            category: category.trim() || undefined,
            subtotal,
            discount_amount: discountAmount || undefined,
            tax_amount: taxAmount || undefined,
            total_amount: totalAmount,
            notes: notes.trim() || undefined,
            payment_terms: paymentTerms.trim() || undefined,
        };

        const processedLineItems: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at' | 'inventory_item'>[] = lineItems
            .filter(li => li.description && li.description.trim() !== '')
            .map(li => ({
                user_id: user.id,
                description: li.description!,
                quantity: Number(li.quantity) || 0,
                unit_price: Number(li.unit_price) || 0,
                line_total: (Number(li.quantity) || 0) * (Number(li.unit_price) || 0),
                inventory_item_id: li.inventory_item_id || undefined,
            }));

        try {
            if (isEditing && invoiceId) {
                const { data, error: updateError } = await invoiceService.updateInvoice(invoiceId, invoiceCoreData);
                if (updateError) throw updateError;
                const { error: deleteOldItemsError } = await supabase.from('invoice_line_items').delete().eq('invoice_id', invoiceId);
                if (deleteOldItemsError) throw deleteOldItemsError;
                if (processedLineItems.length > 0) {
                    const lineItemsWithInvoiceId = processedLineItems.map(li => ({ ...li, invoice_id: invoiceId }));
                    const { error: addNewItemsError } = await supabase.from('invoice_line_items').insert(lineItemsWithInvoiceId);
                    if (addNewItemsError) throw addNewItemsError;
                }
                Alert.alert('Success', `Invoice "${data?.invoice_number}" updated.`);
            } else {
                const { data, error } = await invoiceService.createInvoice(invoiceCoreData, processedLineItems);
                if (error) throw error;
                Alert.alert('Success', `Invoice "${data?.invoice_number}" created.`);
            }
            navigation.goBack();
        } catch (e) {
            const err = e as Error;
            setFormError(err.message);
            Alert.alert('Save Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const initialLoading = loading && ((isEditing && !clientId && clients.length > 0) || (!isEditing && clients.length === 0));
    if (initialLoading  && !formError) { // Only show full loader if no error yet and initial data is pending
        return <ScreenContainer style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></ScreenContainer>;
    }

    return (
        <ScreenContainer scrollable>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>{isEditing ? 'Edit Invoice' : 'Create New Invoice'}</Text>
                {formError && <Text style={styles.errorText}>{formError}</Text>}
                {loading && !initialLoading && <ActivityIndicator style={{ marginBottom: 10 }} size="small" color={colors.primary} />}

                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Client *</Text>
                    <Picker
                        selectedValue={clientId}
                        onValueChange={(itemValue) => setClientId(itemValue as string | null)}
                        style={styles.picker}
                        enabled={!loading && clients.length > 0}
                    >
                        <Picker.Item label="Select a client..." value={null} />
                        {clients.map(c => (
                            <Picker.Item key={c.id} label={c.name} value={c.id} />
                        ))}
                    </Picker>
                </View>

                <Input label="Invoice Number *" value={invoiceNumber} onChangeText={setInvoiceNumber} placeholder="e.g., INV-001" />
                <Input label="Invoice Date * (YYYY-MM-DD)" value={invoiceDate} onChangeText={setInvoiceDate} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation"/>
                <Input label="Due Date * (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation"/>
                
                <View style={styles.pickerContainer}>
                    <Text style={styles.label}>Status *</Text>
                    <Picker
                        selectedValue={status}
                        onValueChange={(itemValue) => setStatus(itemValue as InvoiceStatus)}
                        style={styles.picker}
                    >
                        {INVOICE_STATUSES.map(s => (
                            <Picker.Item key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} value={s} />
                        ))}
                    </Picker>
                </View>

                <Input label="Category" value={category} onChangeText={setCategory} placeholder="e.g., Service, Product Sale" />
                
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Line Items</Text>
                    {lineItems.map((item, index) => (
                        <View key={index} style={styles.lineItemRow}>
                            <Input 
                                placeholder="Item Description" 
                                value={item.description || ''} 
                                onChangeText={(text) => handleLineItemChange(index, 'description', text)}
                                containerStyle={styles.lineItemInputDesc}
                            />
                            <Input 
                                placeholder="Qty" 
                                value={item.quantity?.toString() || ''} 
                                onChangeText={(text) => handleLineItemChange(index, 'quantity', text ? parseFloat(text) : 0)}
                                keyboardType="numeric" 
                                containerStyle={styles.lineItemInputQty}
                            />
                            <Input 
                                placeholder="Price" 
                                value={item.unit_price?.toString() || ''} 
                                onChangeText={(text) => handleLineItemChange(index, 'unit_price', text ? parseFloat(text) : 0)}
                                keyboardType="numeric"
                                containerStyle={styles.lineItemInputPrice}
                            />
                            <Text style={styles.lineItemTotalText}>${(item.line_total || 0).toFixed(2)}</Text>
                            <TouchableOpacity onPress={() => handleRemoveLineItem(index)} style={styles.removeLineItemButton}>
                                <Ionicons name="trash-bin-outline" size={22} color={colors.danger} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {lineItems.length === 0 && <Text style={styles.emptySectionText}>No line items added yet.</Text>}
                    <Button title="Add Line Item" onPress={handleAddLineItem} variant="outline" style={styles.addLineButton} iconLeft={<Ionicons name="add-circle-outline" size={20} color={colors.primary}/>} />
                </View>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Summary</Text>
                  <Input label="Discount Amount" value={discountAmount.toString()} onChangeText={(text) => setDiscountAmount(parseFloat(text) || 0)} placeholder="0.00" keyboardType="numeric" />
                  <Input label="Tax Amount" value={taxAmount.toString()} onChangeText={(text) => setTaxAmount(parseFloat(text) || 0)} placeholder="0.00" keyboardType="numeric" />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Amount:</Text>
                    <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
                  </View>
                </View>

                <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional notes for the client" multiline />
                <Input label="Payment Terms" value={paymentTerms} onChangeText={setPaymentTerms} placeholder="e.g., Net 30, Due on receipt" multiline />

                <Button 
                  title={isEditing ? 'Save Changes' : 'Create Invoice'}
                  onPress={handleSubmit} 
                  loading={loading && !initialLoading} 
                  style={styles.submitButton} 
                />
                <Button 
                  title="Cancel" 
                  onPress={() => navigation.goBack()} 
                  variant="outline" 
                  style={styles.cancelButton}
                  disabled={loading && !initialLoading}
                />
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: { padding: 15, paddingBottom: 30 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 25, textAlign: 'center' },
    errorText: { color: colors.error, marginBottom: 15, textAlign: 'center', fontSize: 14 },
    pickerContainer: { marginBottom: 18 },
    label: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
    picker: { height: 48, width: '100%', backgroundColor: colors.inputBackground, borderColor: colors.border, borderWidth: 1, borderRadius: 8 },
    sectionContainer: { marginTop: 25, marginBottom: 20, padding: 15, backgroundColor: colors.surface, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12 },
    emptySectionText: { color: colors.textSecondary, fontStyle: 'italic', textAlign: 'center', paddingVertical: 10, marginBottom: 10 },
    lineItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    lineItemInputDesc: { flex: 3, marginRight: 8 },
    lineItemInputQty: { flex: 1, marginRight: 8 },
    lineItemInputPrice: { flex: 1.5, marginRight: 8 },
    lineItemTotalText: { flex: 1, fontSize: 14, color: colors.text, textAlign: 'right', marginRight: 8 },
    removeLineItemButton: { padding: 5 },
    addLineButton: { marginTop: 10 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.background, paddingHorizontal: 10, borderRadius: 4, marginBottom: 5 },
    summaryLabel: { fontSize: 16, color: colors.textSecondary },
    summaryValue: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
    submitButton: { marginTop: 30, paddingVertical: 12 },
    cancelButton: { marginTop: 12, paddingVertical: 12, borderColor: colors.textSecondary },
});

export default InvoiceFormScreen; 