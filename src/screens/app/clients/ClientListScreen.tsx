import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import ListItem from '@/components/common/ListItem/ListItem';
import Button from '@/components/common/Button/Button';
import { ROUTES } from '@/constants/routes';
import { Client } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as clientService from '@/api/clientService';

export type ClientStackParamList = {
  [ROUTES.CLIENT_LIST]: undefined;
  [ROUTES.CLIENT_DETAIL]: { clientId: string };
  [ROUTES.CLIENT_FORM]: { clientId?: string };
};

type ClientListScreenProps = NativeStackScreenProps<ClientStackParamList, typeof ROUTES.CLIENT_LIST>;

export const ClientListScreen: React.FC<ClientListScreenProps> = ({ navigation }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);

  const { user } = useAuth();

  const fetchClients = useCallback(async () => {
    if (!user) {
      setError("User not authenticated. Cannot fetch clients.");
      setClients([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await clientService.getClients(user.id);
      if (fetchError) {
        setError(fetchError.message);
        Alert.alert("Error Fetching Clients", fetchError.message);
        setClients([]);
      } else if (data) {
        setClients(data);
      } else {
        setClients([]);
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
      Alert.alert("Error", `An unexpected error occurred: ${err.message}`);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchClients();
    }, [fetchClients])
  );
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (client.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClient = (clientId: string) => {
    navigation.navigate(ROUTES.CLIENT_FORM, { clientId });
  };

  const handleViewClientDetails = (clientId: string) => {
    navigation.navigate(ROUTES.CLIENT_DETAIL, { clientId });
  };

  const renderItem = ({ item }: { item: Client }) => (
    <ListItem
      title={item.name}
      subtitle={item.email || 'No email'}
      onPress={() => handleViewClientDetails(item.id)}
      rightIconName="chevron-forward-outline"
    />
  );

  if (loading) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading clients...</Text>
      </ScreenContainer>
    );
  }

  if (error && !clients.length) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={fetchClients} />
      </ScreenContainer>
    );
  }

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
            <Text style={styles.filterText}>Client filter options will be here.</Text>
        </View>
      )}
      
      {error && clients.length > 0 && 
        <View style={styles.inlineErrorView}>
            <Text style={styles.inlineErrorText}>Error refreshing data: {error}</Text>
        </View>
      }

      <FlatList
        data={filteredClients}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchClients} 
        refreshing={loading}
        ListEmptyComponent={() => (
          !loading && (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="people-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyStateText}>{searchQuery ? 'No clients match your search.' : 'No clients yet.'}</Text>
              {!searchQuery && <Text style={styles.emptyStateSubText}>Add your first client to get started.</Text>}
              <Button 
                title="Clear Search" 
                onPress={() => setSearchQuery('')} 
                variant='ghost' 
                style={{ marginTop: searchQuery ? 10: 0, display: searchQuery ? 'flex' : 'none'}}
              />
            </View>
          )
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
  centerAlign: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  filterPanel: {
    marginHorizontal: 10,
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
    paddingBottom: 80,
    paddingHorizontal: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    paddingHorizontal: 20,
    color: colors.error,
    fontSize: 16,
    marginBottom: 10,
  },
  inlineErrorView: {
    backgroundColor: colors.errorBackground,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  inlineErrorText: {
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

export default ClientListScreen; 