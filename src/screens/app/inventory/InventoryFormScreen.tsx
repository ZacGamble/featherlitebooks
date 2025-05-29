import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { InventoryStackParamList } from '@/navigation/AppTabs'; // Corrected import path
import { ROUTES } from '@/constants/routes';
import { InventoryItem } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';

type InventoryFormScreenProps = NativeStackScreenProps<InventoryStackParamList, typeof ROUTES.INVENTORY_FORM>;

export const InventoryFormScreen: React.FC<InventoryFormScreenProps> = ({ navigation, route }) => {
  const itemId = route.params?.itemId;
  const isEditing = !!itemId;

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (isEditing && itemId) {
      fetchItemDetails(itemId);
    }
  }, [itemId, isEditing]);

  const fetchItemDetails = async (id: string) => {
    setLoading(true);
    setFormError(null);
    // In a real app, fetch from Supabase
    // const { data, error } = await supabase.from('inventory_items').select('*').eq('id', id).single();
    // For now, using a mock or assuming fields are cleared for new item
    const MOCK_EDIT_ITEM: InventoryItem = { id: '1', name: 'Feather Pen Edit', sku: 'FP001-E', quantity: 100, unit_price: 1.99, category: 'Stationery', vendor: 'Quill Inc.' };
    if (id === '1') { // Simulate finding an item
        setName(MOCK_EDIT_ITEM.name);
        setSku(MOCK_EDIT_ITEM.sku);
        setQuantity(MOCK_EDIT_ITEM.quantity.toString());
        setUnitPrice(MOCK_EDIT_ITEM.unit_price.toString());
        setCategory(MOCK_EDIT_ITEM.category || '');
        setVendor(MOCK_EDIT_ITEM.vendor || '');
    } else {
        setFormError('Item not found for editing.');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!name || !sku || !quantity || !unitPrice) {
      setFormError('Please fill in all required fields (Name, SKU, Quantity, Unit Price).');
      return;
    }
    if (!user) {
        setFormError('User not authenticated. Cannot save item.');
        return;
    }

    setLoading(true);
    setFormError(null);

    const itemData: Omit<InventoryItem, 'id'> & { user_id: string } = {
      name,
      sku,
      quantity: parseInt(quantity, 10) || 0,
      unit_price: parseFloat(unitPrice) || 0,
      category: category || null,
      vendor: vendor || null,
      user_id: user.id,
    };

    // try {
    //   let response;
    //   if (isEditing && itemId) {
    //     response = await supabase.from('inventory_items').update(itemData).eq('id', itemId).select();
    //   } else {
    //     response = await supabase.from('inventory_items').insert(itemData).select();
    //   }
    //   if (response.error) throw response.error;
    //   Alert.alert('Success', `Inventory item ${isEditing ? 'updated' : 'added'} successfully.`);
    //   navigation.goBack(); // Or navigate to list/detail
    // } catch (e) {
    //   setFormError((e as Error).message);
    // } finally {
    //   setLoading(false);
    // }
    Alert.alert('Mock Submit', `Simulated ${isEditing ? 'update' : 'add'} for: ${name}`);
    setLoading(false);
    navigation.goBack();
  };

  if (loading && isEditing && !name) { // Show loading only when fetching details for edit
    return <ScreenContainer><Text style={styles.loadingText}>Loading item details...</Text></ScreenContainer>;
  }

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}</Text>
        
        {formError && <Text style={styles.errorText}>{formError}</Text>}

        <Input label="Item Name *" value={name} onChangeText={setName} placeholder="e.g., Lite Notebook" />
        <Input label="SKU (Stock Keeping Unit) *" value={sku} onChangeText={setSku} placeholder="e.g., LN002" />
        <Input label="Quantity *" value={quantity} onChangeText={setQuantity} placeholder="e.g., 50" keyboardType="numeric" />
        <Input label="Unit Price *" value={unitPrice} onChangeText={setUnitPrice} placeholder="e.g., 4.50" keyboardType="decimal-pad" />
        <Input label="Category" value={category} onChangeText={setCategory} placeholder="e.g., Stationery" />
        <Input label="Vendor" value={vendor} onChangeText={setVendor} placeholder="e.g., PaperCo" />

        <Button 
          title={isEditing ? 'Save Changes' : 'Add Item'} 
          onPress={handleSubmit} 
          loading={loading && !isEditing} // Show loading for submit, not for initial fetch
          style={styles.submitButton} 
        />
        <Button 
          title="Cancel" 
          onPress={() => navigation.goBack()} 
          variant="outline" 
          style={styles.cancelButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
  errorText: {
    color: colors.error,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  submitButton: {
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 10,
  },
});

export default InventoryFormScreen; 