import React, { useState, useEffect, useCallback } from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InventoryStackParamList } from '@/navigation/InventoryStack';
import { ROUTES } from '@/constants/routes';
import { InventoryItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import * as inventoryService from '@/api/inventoryService';

type Props = NativeStackScreenProps<InventoryStackParamList, typeof ROUTES.INVENTORY_ITEM_FORM>;

export const InventoryItemFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const itemId = route.params?.itemId;
  const isEditing = !!itemId;
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [quantityOnHand, setQuantityOnHand] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchItemDetails = useCallback(async (id: string) => {
    setLoading(true);
    setFormError(null);
    try {
      const { data, error } = await inventoryService.getInventoryItemById(id);
      if (error) {
        setFormError(error.message);
        window.alert(`Error fetching item: ${error.message}`);
      } else if (data) {
        setName(data.name);
        setSku(data.sku || '');
        setDescription(data.description || '');
        setQuantityOnHand(data.quantity_on_hand.toString());
        setUnitPrice(data.unit_price.toString());
        setLowStockThreshold(data.low_stock_threshold?.toString() || '');
      } else {
        setFormError('Inventory item not found.');
        window.alert('Inventory item not found.');
      }
    } catch (e) {
      const err = e as Error;
      setFormError(err.message);
      window.alert(`An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEditing && itemId) {
      fetchItemDetails(itemId);
    }
  }, [itemId, isEditing, fetchItemDetails]);

  const handleSubmit = async () => {
    if (!user) {
      window.alert('User not authenticated. Cannot save item.');
      return;
    }
    if (!name.trim()) {
      window.alert('Item name is required.');
      return;
    }
    if (!quantityOnHand.trim() || isNaN(parseFloat(quantityOnHand)) || parseFloat(quantityOnHand) < 0) {
        window.alert('Valid quantity is required.');
        return;
    }
    if (!unitPrice.trim() || isNaN(parseFloat(unitPrice)) || parseFloat(unitPrice) < 0) {
        window.alert('Valid unit price is required.');
        return;
    }

    setLoading(true);
    setFormError(null);

    const currentQuantityOnHand = parseFloat(quantityOnHand);
    const currentUnitPrice = parseFloat(unitPrice);
    const currentLowStockThreshold = lowStockThreshold.trim() ? parseFloat(lowStockThreshold) : null;

    if (currentLowStockThreshold !== null && (isNaN(currentLowStockThreshold) || currentLowStockThreshold < 0)) {
        window.alert('Valid low stock threshold is required if provided.');
        setLoading(false);
        return;
    }

    const itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      name: name.trim(),
      sku: sku.trim() || null,
      description: description.trim() || null,
      quantity_on_hand: currentQuantityOnHand,
      unit_price: currentUnitPrice,
      low_stock_threshold: currentLowStockThreshold,
    };
    
    const updatePayload: Partial<Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    > = {
        name: name.trim(),
        sku: sku.trim() || null,
        description: description.trim() || null,
        quantity_on_hand: currentQuantityOnHand,
        unit_price: currentUnitPrice,
        low_stock_threshold: currentLowStockThreshold,
    };

    try {
      if (isEditing && itemId) {
        const { data, error } = await inventoryService.updateInventoryItem(itemId, updatePayload);
        if (error) throw error;
        window.alert(`Item "${data?.name}" updated successfully.`);
      } else {
        const { data, error } = await inventoryService.createInventoryItem(itemData);
        if (error) throw error;
        window.alert(`Item "${data?.name}" added successfully.`);
      }
      navigation.goBack();
    } catch (e) {
      const err = e as Error;
      setFormError(err.message);
      window.alert(`Save Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}</Text>
        
        {formError && <Text style={styles.errorText}>{formError}</Text>}

        <Input label="Item Name *" value={name} onChangeText={setName} placeholder="e.g., Blue Widget" />
        <Input label="SKU (Stock Keeping Unit)" value={sku} onChangeText={setSku} placeholder="e.g., WIDGET-BLU-LG" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Detailed description of the item" multiline />
        <Input label="Quantity on Hand *" value={quantityOnHand} onChangeText={setQuantityOnHand} placeholder="e.g., 100" keyboardType="numeric" />
        <Input label="Unit Price *" value={unitPrice} onChangeText={setUnitPrice} placeholder="e.g., 19.99" keyboardType="numeric" />
        <Input label="Low Stock Threshold" value={lowStockThreshold} onChangeText={setLowStockThreshold} placeholder="e.g., 10" keyboardType="numeric" />

        <Button 
          title={isEditing ? 'Save Changes' : 'Add Item'} 
          onPress={handleSubmit} 
          loading={loading} 
          style={styles.submitButton} 
        />
        <Button 
          title="Cancel" 
          onPress={() => navigation.goBack()} 
          variant="outline" 
          style={styles.cancelButton}
          disabled={loading}
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

export default InventoryItemFormScreen; 