import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Button from '@/components/common/Button/Button';
import { InventoryStackParamList } from '@/navigation/InventoryStack';
import { ROUTES } from '@/constants/routes';
import { InventoryItem } from '@/types';
import { colors } from '@/constants/colors';
import * as inventoryService from '@/api/inventoryService';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<InventoryStackParamList, typeof ROUTES.INVENTORY_ITEM_DETAIL>;

export const InventoryItemDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { itemId } = route.params;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const fetchItemDetails = useCallback(async () => {
    if (!itemId) {
      setError('Item ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setActionLoading(false);
    setError(null);
    try {
      const { data, error: fetchError } = await inventoryService.getInventoryItemById(itemId);
      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setItem(data);
      } else {
        setError('Inventory item not found.');
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useFocusEffect(
    useCallback(() => {
      fetchItemDetails();
    }, [fetchItemDetails])
  );

  const handleEdit = () => {
    if (item) {
      navigation.navigate(ROUTES.INVENTORY_ITEM_FORM, { itemId: item.id });
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`);
    if (confirmed) {
      setActionLoading(true);
      try {
        const { error: deleteError } = await inventoryService.deleteInventoryItem(item.id);
        if (deleteError) {
          setError(deleteError.message);
          window.alert(`Delete Error: ${deleteError.message}`);
        } else {
          window.alert(`Item "${item.name}" deleted successfully.`);
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
        <Text style={styles.messageText}>Loading item details...</Text>
      </ScreenContainer>
    );
  }

  if (error && !item) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.messageText}>{error}</Text>
        <Button title="Retry" onPress={fetchItemDetails} />
        <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" style={{marginTop: 10}} />
      </ScreenContainer>
    );
  }

  if (!item) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <Ionicons name="help-circle-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.messageText}>Item not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.topBarContainer}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerSection}>
          <Ionicons name="cube-outline" size={80} color={colors.primary} />
          <Text style={styles.itemName}>{item.name}</Text>
          {item.sku && <Text style={styles.itemSku}>SKU: {item.sku}</Text>}
        </View>

        {error && <Text style={[styles.messageText, styles.inlineError]}>{error}</Text>} 

        <View style={styles.detailCard}>
          <DetailItem label="Description" value={item.description} iconName="document-text-outline" />
          <DetailItem label="Quantity on Hand" value={item.quantity_on_hand.toString()} iconName="file-tray-stacked-outline" />
          <DetailItem label="Unit Price" value={`$${item.unit_price.toFixed(2)}`} iconName="cash-outline" />
          <DetailItem label="Low Stock Threshold" value={item.low_stock_threshold?.toString()} iconName="stats-chart-outline" />
        </View>
        
        <View style={styles.actionsContainer}>
          <Button 
            title="Edit Item" 
            onPress={handleEdit} 
            style={styles.actionButton} 
            iconLeft={<Ionicons name="pencil-outline" size={18} color={colors.white} />}
            disabled={actionLoading}
          />
          <Button 
            title="Delete Item" 
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

interface DetailItemProps {
  label: string;
  value?: string | null;
  iconName: keyof typeof Ionicons.glyphMap;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, iconName }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <View style={styles.detailItemContainer}>
      <Ionicons name={iconName} size={20} color={colors.primary} style={styles.detailIcon} />
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} selectable>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerAlign: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  topBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10, 
  },
  backButton: {
    padding: 5, 
    marginRight: 10,
  },
  container: {
    paddingTop: 5,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 10,
    textAlign: 'center',
  },
  itemSku: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 5,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detailItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailIcon: {
    marginRight: 15,
    marginTop: 3, 
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  actionsContainer: {
    marginTop: 10,
  },
  actionButton: {
    marginBottom: 12,
  },
  messageText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inlineError: {
    color: colors.error,
    marginBottom: 15,
  },
});

export default InventoryItemDetailScreen; 