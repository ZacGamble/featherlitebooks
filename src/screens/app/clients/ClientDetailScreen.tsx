import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Button from '@/components/common/Button/Button';
import { ClientStackParamList } from './ClientListScreen';
import { ROUTES } from '@/constants/routes';
import { Client } from '@/types';
import { colors } from '@/constants/colors';
import * as clientService from '@/api/clientService';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

type ClientDetailScreenProps = NativeStackScreenProps<ClientStackParamList, typeof ROUTES.CLIENT_DETAIL>;

export const ClientDetailScreen: React.FC<ClientDetailScreenProps> = ({ navigation, route }) => {
  const { clientId } = route.params;
  const { user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientDetails = useCallback(async () => {
    if (!clientId) {
      setError('Client ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setActionLoading(false);
    setError(null);
    try {
      const { data, error: fetchError } = await clientService.getClientById(clientId);
      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setClient(data);
      } else {
        setError('Client not found.');
      }
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useFocusEffect(
    useCallback(() => {
      fetchClientDetails();
    }, [fetchClientDetails])
  );

  const handleEdit = () => {
    if (client) {
      navigation.navigate(ROUTES.CLIENT_FORM, { clientId: client.id });
    }
  };

  const handleDelete = async () => {
    if (!client) {
      console.log('Delete attempted but no client data available.');
      return;
    }
    if (!user) {
      console.log('Delete attempted but no authenticated user available.');
      window.alert('User not authenticated. Cannot delete client.');
      return;
    }

    console.log(`Attempting to delete client with ID: ${client.id} by user ID: ${user.id}`);

    const confirmed = window.confirm(`Are you sure you want to delete "${client.name}"? This action cannot be undone.`);

    if (confirmed) {
      setActionLoading(true);
      try {
        console.log('User confirmed. Calling clientService.deleteClient...');
        const { error: deleteError } = await clientService.deleteClient(client.id);
        
        if (deleteError) {
          console.error('Error deleting client:', JSON.stringify(deleteError, null, 2));
          setError(deleteError.message);
          window.alert(`Delete Error: ${deleteError.message} (Code: ${deleteError.code})`);
        } else {
          console.log('Client deleted successfully from service.');
          window.alert(`Client "${client.name}" deleted successfully.`);
          navigation.goBack(); 
        }
      } catch (e) {
        const err = e as Error;
        console.error('Exception during delete process:', err);
        setError(err.message);
        window.alert(`Delete Error: An unexpected error occurred: ${err.message}`);
      } finally {
        setActionLoading(false);
        console.log('Delete action finished.');
      }
    } else {
      console.log('User cancelled delete action.');
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.messageText}>Loading client details...</Text>
      </ScreenContainer>
    );
  }

  if (error && !client) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.messageText}>{error}</Text>
        <Button title="Retry" onPress={fetchClientDetails} />
        <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" style={{marginTop: 10}} />
      </ScreenContainer>
    );
  }

  if (!client) {
    return (
      <ScreenContainer style={styles.centerAlign}>
        <Ionicons name="help-circle-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.messageText}>Client not found.</Text>
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
          <Ionicons name="person-circle-outline" size={80} color={colors.primary} />
          <Text style={styles.clientName}>{client.name}</Text>
        </View>

        {error && <Text style={[styles.messageText, styles.inlineError]}>{error}</Text>} 

        <View style={styles.detailCard}>
          <DetailItem label="Email" value={client.email} iconName="mail-outline" />
          <DetailItem label="Phone" value={client.phone} iconName="call-outline" />
          <DetailItem label="Address Line 1" value={client.address_line1} iconName="location-outline" />
          {client.address_line2 && <DetailItem label="Address Line 2" value={client.address_line2} iconName="business-outline" />}
          {client.city && <DetailItem label="City" value={client.city} iconName="map-outline" />}
          {client.state_province && <DetailItem label="State/Province" value={client.state_province} iconName="map-outline" />}
          {client.postal_code && <DetailItem label="Postal Code" value={client.postal_code} iconName="map-outline" />}
          {client.country && <DetailItem label="Country" value={client.country} iconName="flag-outline" />}
        </View>
        
        <View style={styles.actionsContainer}>
          <Button 
            title="Edit Client" 
            onPress={handleEdit} 
            style={styles.actionButton} 
            iconLeft={<Ionicons name="pencil-outline" size={18} color={colors.white} />}
            disabled={actionLoading}
          />
          <Button 
            title="Delete Client" 
            onPress={handleDelete} 
            variant="danger" 
            style={styles.actionButton} 
            iconLeft={<Ionicons name="trash-outline" size={18} color={colors.white} />}
            loading={actionLoading}
          />
        </View>

        {/* <View style={styles.relatedInfoCard}>
          <Text style={styles.sectionTitle}>Related Invoices</Text>
          <Text style={styles.placeholderText}>Invoices for this client will appear here.</Text>
        </View> */}
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
  if (!value) return null;
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
  clientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 10,
    textAlign: 'center',
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
    boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
  },
  detailItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailItemContainerLast: {
    borderBottomWidth: 0,
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

export default ClientDetailScreen; 