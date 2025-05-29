import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import ListItem from '@/components/common/ListItem/ListItem';
import Button from '@/components/common/Button/Button';
import { InventoryStackParamList } from '@/navigation/AppTabs'; // Corrected import path
import { ROUTES } from '@/constants/routes';
import { InventoryItem } from '@/types'; // Assuming you have this type
import { useSupabase } from '@/hooks/useSupabase'; // For fetching data
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type InventoryListScreenProps = NativeStackScreenProps<InventoryStackParamList, typeof ROUTES.INVENTORY_LIST>;

// Mock data for initial display
const MOCK_ITEMS: InventoryItem[] = [
  { id: '1', name: 'Feather Pen', sku: 'FP001', quantity: 100, unit_price: 1.99, category: 'Stationery' },
  { id: '2', name: 'Lite Notebook', sku: 'LN002', quantity: 50, unit_price: 4.50, category: 'Stationery' },
  { id: '3', name: 'Book Weight Scale', sku: 'BWS003', quantity: 10, unit_price: 29.99, category: 'Tools' },
];

export const InventoryListScreen: React.FC<InventoryListScreenProps> = ({ navigation }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const supabase = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    if (!user) {
        setError("User not authenticated");
        setItems(MOCK_ITEMS); // Fallback to mock data if user is not available
        return;
    }
    setLoading(true);
    setError(null);
    // try {
    //   const { data, error: fetchError } = await supabase
    //     .from('inventory_items') // Replace with your actual table name
    //     .select('*')
    //     .eq('user_id', user.id); // Filter by user_id

    //   if (fetchError) throw fetchError;
    //   setItems(data || []);
    // } catch (e) {
    //   setError((e as Error).message);
    //   setItems(MOCK_ITEMS); // Fallback to mock data on error
    // } finally {
    //   setLoading(false);
    // }
    // For now, using mock data to avoid Supabase setup issues during scaffolding
    setItems(MOCK_ITEMS);
    setLoading(false);
  };
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <ListItem
      title={item.name}
      subtitle={`SKU: ${item.sku} | Qty: ${item.quantity} | Price: $${item.unit_price.toFixed(2)}`}
      onPress={() => navigation.navigate(ROUTES.INVENTORY_DETAIL, { itemId: item.id })}
      rightIconName="chevron-forward-outline"
    />
  );

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
        <TouchableOpacity onPress={() => setFilterVisible(!filterVisible)} style={styles.iconButton}>
            <Ionicons name="filter-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {filterVisible && (
        <View style={styles.filterPanel}>
            <Text style={styles.filterText}>Filter options placeholder (e.g., by category, stock status).</Text>
            {/* Add filter components here */}
        </View>
      )}

      {loading && <Text style={styles.loadingText}>Loading items...</Text>}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      
      {!loading && !error && filteredItems.length === 0 && (
        <Text style={styles.emptyText}>No inventory items found. Add some!</Text>
      )}

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchInventoryItems} // Pull to refresh
        refreshing={loading}
      />
      <Button
        title="Add New Item"
        onPress={() => navigation.navigate(ROUTES.INVENTORY_FORM, {})}
        style={styles.addButton}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5, // Match ScreenContainer padding or adjust
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconButton: {
    padding: 8,
  },
  filterPanel: {
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 70, // Ensure space for the add button
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: colors.textSecondary,
  },
  errorText: {
    textAlign: 'center',
    padding: 20,
    color: colors.error,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: colors.textSecondary,
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default InventoryListScreen; 