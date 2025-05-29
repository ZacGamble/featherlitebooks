import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Button from '@/components/common/Button/Button';
import Card from '@/components/common/Card/Card';
import { ClientStackParamList } from './ClientListScreen'; // Re-use from ClientListScreen
import { ROUTES } from '@/constants/routes';
import { Client } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
// import * as clientService from '@/api/clientService';

type ClientDetailScreenProps = NativeStackScreenProps<ClientStackParamList, typeof ROUTES.CLIENT_DETAIL>;

export const ClientDetailScreen: React.FC<ClientDetailScreenProps> = ({ navigation, route }) => {
  const { clientId } = route.params;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useSupabase(); // Or use clientService

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  const fetchClientDetails = async () => {
    setLoading(true);
    setError(null);
    // TODO: Replace with actual API call
    // const { data, error: fetchError } = await clientService.getClientById(clientId);
    // if (fetchError) { setError(fetchError.message); setLoading(false); return; }
    // setClient(data);
    const MOCK_DETAIL_CLIENT: Client = { 
        id: clientId, 
        name: `Client ${clientId} Detailed Name`, 
        email: `detail-${clientId}@example.com`, 
        phone: `555-0${clientId.padStart(3, '0')}`,
        address: `${clientId} Mockington Lane, Detailville`,
        user_id: 'mock_user_id',
        value: clientId,
        label: `Client ${clientId} Detailed Name`
    };
    setClient(MOCK_DETAIL_CLIENT);
    setLoading(false);
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this client? This may also affect associated invoices and records.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            setLoading(true);
            // TODO: Replace with actual API call
            // const { error: deleteError } = await clientService.deleteClient(clientId);
            // if (deleteError) {
            //   Alert.alert('Error', `Failed to delete client: ${deleteError.message}`);
            //   setError(deleteError.message);
            // } else {
            //   Alert.alert('Success', 'Client deleted successfully.');
            //   navigation.goBack();
            // }
            Alert.alert('Mock Delete', `Simulated deletion for client ID: ${clientId}`);
            setLoading(false);
            navigation.goBack();
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading && !client) {
    return <ScreenContainer><Text style={styles.messageText}>Loading client details...</Text></ScreenContainer>;
  }

  if (error) {
    return <ScreenContainer><Text style={styles.messageText}>Error: {error}</Text></ScreenContainer>;
  }

  if (!client) {
    return <ScreenContainer><Text style={styles.messageText}>Client not found.</Text></ScreenContainer>;
  }

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.detailCard}>
            <View style={styles.headerSection}>
                <Ionicons name="person-circle-outline" size={60} color={colors.primary} style={styles.clientIcon} />
                <Text style={styles.clientName}>{client.name}</Text>
            </View>

            {client.email && (
                <View style={styles.detailRow}>
                    <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.icon} />
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{client.email}</Text>
                </View>
            )}
            {client.phone && (
                <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.icon} />
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{client.phone}</Text>
                </View>
            )}
            {client.address && (
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.icon} />
                    <Text style={styles.detailLabel}>Address:</Text>
                    <Text style={styles.detailValue} selectable>{client.address}</Text>
                </View>
            )}
            {/* Add more client fields here */}
        </Card>

        {/* Placeholder for related information like recent invoices or projects */}
        <Card style={styles.relatedInfoCard}>
            <Text style={styles.sectionTitle}>Related Activity (Placeholder)</Text>
            <Text style={styles.placeholderText}>- Recent Invoices for {client.name}</Text>
            <Text style={styles.placeholderText}>- Projects associated with {client.name}</Text>
        </Card>

        <Button 
          title="Edit Client"
          onPress={() => navigation.navigate(ROUTES.CLIENT_FORM, { clientId: client.id })}
          style={styles.actionButton}
          iconLeft={<Ionicons name="pencil-outline" size={20} color={colors.white} />}
        />
        <Button 
          title="Delete Client"
          onPress={handleDelete}
          variant="danger" // Ensure your Button component supports this variant for styling
          loading={loading} // If delete becomes async
          style={styles.actionButton}
          iconLeft={<Ionicons name="trash-bin-outline" size={20} color={colors.white} />}
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  clientIcon: {
    marginBottom: 10,
  },
  clientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  icon: {
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    marginRight: 5,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    flexShrink: 1, // Allows text to wrap if it's too long
  },
  relatedInfoCard: {
      padding: 15,
      marginBottom: 20,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
  },
  placeholderText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 5,
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

export default ClientDetailScreen; 