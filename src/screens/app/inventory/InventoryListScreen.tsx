import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import ListItem from '@/components/common/ListItem/ListItem';
import Button from '@/components/common/Button/Button';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InventoryStackParamList } from '@/navigation/InventoryStack';
import { ROUTES } from '@/constants/routes';
import { InventoryItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as inventoryService from '@/api/inventoryService';

type Props = NativeStackScreenProps<InventoryStackParamList, typeof ROUTES.INVENTORY_LIST>;

export const InventoryListScreen: React.FC<Props> = ({ navigation }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // const [filterVisible, setFilterVisible] = useState(false); // Future use

  const { user } = useAuth();

  const fetchItems = useCallback(async () => {
    if (!user) {
      setError("User not authenticated. Cannot fetch inventory.");
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await inventoryService.getInventoryItems(user.id);
      if (fetchError) {
        setError(fetchError.message);
        window.alert(`Error fetching inventory: ${fetchError.message}`);
        setItems([]);
      } else if (data) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      window.alert(`An unexpected error occurred: ${err.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems])
  );
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <ListItem
      title={item.name}
      subtitle={`SKU: ${item.sku || 'N/A'} | Qty: ${item.quantity_on_hand} | Price: $${item.unit_price.toFixed(2)}`}
      onPress={() => navigation.navigate(ROUTES.INVENTORY_ITEM_DETAIL, { itemId: item.id })}
      rightIconName="chevron-forward-outline"
    />
  );

  if (loading && items.length === 0) { // Show full screen loader only on initial load
    return (
      <ScreenContainer style={styles.centerAlign}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.messageText}>Loading inventory...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.controlsContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name or SKU..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray}
        />
        {/* <TouchableOpacity onPress={() => setFilterVisible(!filterVisible)} style={styles.iconButton}>
            <Ionicons name="filter-outline" size={24} color={colors.primary} />
        </TouchableOpacity> */}
      </View>

      {/* {filterVisible && (
        <View style={styles.filterPanel}>
            <Text style={styles.filterText}>Inventory filter options will be here.</Text>
        </View>
      )} */}
      
      {error && (
          <View style={styles.inlineErrorView}>
            <Text style={styles.errorText}>Error: {error}. Pull to retry.</Text>
          </View>
      )}

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchItems} 
        refreshing={loading} // Shows pull-to-refresh indicator
        ListEmptyComponent={() => (
          !loading && (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="file-tray-stacked-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyStateText}>{searchQuery ? 'No items match your search.' : 'No inventory items yet.'}</Text>
              {!searchQuery && <Text style={styles.emptyStateSubText}>Add your first item to get started.</Text>}
            </View>
          )
        )}
      />
      <Button
        title="Add New Item"
        onPress={() => navigation.navigate(ROUTES.INVENTORY_ITEM_FORM, {})}
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
  iconButton: {
    padding: 10,
  },
  // filterPanel: { /* ... */ },
  // filterText: { /* ... */ },
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

export default InventoryListScreen; 