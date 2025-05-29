import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Button from '@/components/common/Button/Button';
import Card from '@/components/common/Card/Card';
import { InventoryStackParamList } from '@/navigation/AppTabs';
import { ROUTES } from '@/constants/routes';
import { InventoryItem } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { colors } from '@/constants/colors';

type InventoryDetailScreenProps = NativeStackScreenProps<InventoryStackParamList, typeof ROUTES.INVENTORY_DETAIL>;

export const InventoryDetailScreen: React.FC<InventoryDetailScreenProps> = ({ navigation, route }) => {
  const { itemId } = route.params;
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useSupabase();

  useEffect(() => {
    fetchItemDetails();
  }, [itemId]);

  const fetchItemDetails = async () => {
    setLoading(true);
    setError(null);
    // try {
    //   const { data, error: fetchError } = await supabase
    //     .from('inventory_items')
    //     .select('*')
    //     .eq('id', itemId)
    //     .single();
    //   if (fetchError) throw fetchError;
    //   setItem(data);
    // } catch (e) {
    //   setError((e as Error).message);
    // }
    // For now, using mock data
    const MOCK_DETAIL_ITEM: InventoryItem = { id: itemId, name: `Item ${itemId} Name`, sku: `SKU${itemId}`, quantity: 50, unit_price: 19.99, category: 'Mock Category', vendor: 'Mock Vendor' };
    setItem(MOCK_DETAIL_ITEM);
    setLoading(false);
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            setLoading(true);
            // try {
            //   const { error: deleteError } = await supabase.from('inventory_items').delete().eq('id', itemId);
            //   if (deleteError) throw deleteError;
            //   Alert.alert('Success', 'Item deleted successfully.');
            //   navigation.goBack();
            // } catch (e) {
            //   setError((e as Error).message);
            //   Alert.alert('Error', 'Failed to delete item.');
            // } finally {
            //   setLoading(false);
            // }
            Alert.alert('Mock Delete', `Simulated deletion for item ID: ${itemId}`);
            setLoading(false);
            navigation.goBack();
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading && !item) {
    return <ScreenContainer><Text style={styles.messageText}>Loading item details...</Text></ScreenContainer>;
  }

  if (error) {
    return <ScreenContainer><Text style={styles.messageText}>Error: {error}</Text></ScreenContainer>;
  }

  if (!item) {
    return <ScreenContainer><Text style={styles.messageText}>Item not found.</Text></ScreenContainer>;
  }

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.detailCard}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>SKU:</Text>
                <Text style={styles.detailValue}>{item.sku}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quantity:</Text>
                <Text style={styles.detailValue}>{item.quantity}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Unit Price:</Text>
                <Text style={styles.detailValue}>${item.unit_price.toFixed(2)}</Text>
            </View>
            {item.category && (
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Category:</Text>
                    <Text style={styles.detailValue}>{item.category}</Text>
                </View>
            )}
            {item.vendor && (
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vendor:</Text>
                    <Text style={styles.detailValue}>{item.vendor}</Text>
                </View>
            )}
        </Card>

        <Button 
          title="Edit Item"
          onPress={() => navigation.navigate(ROUTES.INVENTORY_FORM, { itemId: item.id })}
          style={styles.actionButton}
        />
        <Button 
          title="Delete Item"
          onPress={handleDelete}
          variant="danger"
          loading={loading} // Loading state for delete action
          style={styles.actionButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  detailCard: {
    padding: 20, 
    marginBottom: 20,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
  },
  actionButton: {
    marginTop: 10,
  },
  messageText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default InventoryDetailScreen; 