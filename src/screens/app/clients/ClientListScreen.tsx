import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import ListItem from '@/components/common/ListItem/ListItem';
import Button from '@/components/common/Button/Button';
import { ROUTES } from '@/constants/routes';
import { Client } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export type ClientStackParamList = {
  [ROUTES.CLIENT_LIST]: undefined;
  [ROUTES.CLIENT_DETAIL]: { clientId: string };
  [ROUTES.CLIENT_FORM]: { clientId?: string };
};

type ClientListScreenProps = NativeStackScreenProps<ClientStackParamList, typeof ROUTES.CLIENT_LIST>;

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Global Corp Ltd.', email: 'contact@globalcorp.com', phone: '555-0101', user_id: 'mock_user_id', value: '1', label: 'Global Corp Ltd.' },
  { id: '2', name: 'Local Business Solutions', email: 'info@lbs.local', phone: '555-0202', user_id: 'mock_user_id', value: '2', label: 'Local Business Solutions' },
  { id: '3', name: 'Innovatech Startup', email: 'hello@innovatech.io', user_id: 'mock_user_id', value: '3', label: 'Innovatech Startup' },
];

export const ClientListScreen: React.FC<ClientListScreenProps> = ({ navigation }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const supabase = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    fetchClients();
  }, [user]);

  const fetchClients = async () => {
    if (!user) {
        setError("User not authenticated. Cannot fetch clients.");
        setClients([]);
        return;
    }
    setLoading(true);
    setError(null);
    setClients(MOCK_CLIENTS);
    setLoading(false);
  };
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (client.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Client }) => (
    <ListItem
      title={item.name}
      subtitle={item.email || 'No email'}
      onPress={() => navigation.navigate(ROUTES.CLIENT_DETAIL, { clientId: item.id })}
      rightIconName="chevron-forward-outline"
    />
  );

  return (
    <ScreenContainer>
      <View style={styles.controlsContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name or email..."
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
            <Text style={styles.filterText}>Client filter options (e.g., by tags, last contact date) will be here.</Text>
        </View>
      )}

      {loading && <Text style={styles.loadingText}>Loading clients...</Text>}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      
      {!loading && !error && filteredClients.length === 0 && (
        <Text style={styles.emptyText}>No clients found. Tap below to add your first client!</Text>
      )}

      <FlatList
        data={filteredClients}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchClients} 
        refreshing={loading}
        ListEmptyComponent={() => (
          !loading && !error && clients.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="people-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyStateText}>No clients yet.</Text>
              <Text style={styles.emptyStateSubText}>Add your first client to get started.</Text>
            </View>
          ) : null
        )}
      />
      <Button
        title="Add New Client"
        onPress={() => navigation.navigate(ROUTES.CLIENT_FORM, {})}
        style={styles.addButton}
        iconLeft={<Ionicons name="add-circle-outline" size={20} color={colors.white} />}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
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
    paddingBottom: 70,
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
    paddingVertical: 40,
    color: colors.textSecondary,
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 10,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ClientListScreen; 