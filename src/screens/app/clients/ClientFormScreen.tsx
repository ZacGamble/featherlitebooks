import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { ClientStackParamList } from './ClientListScreen'; // Re-use from ClientListScreen
import { ROUTES } from '@/constants/routes';
import { Client } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
import * as clientService from '@/api/clientService'; // Uncommented and will be used

type ClientFormScreenProps = NativeStackScreenProps<ClientStackParamList, typeof ROUTES.CLIENT_FORM>;

export const ClientFormScreen: React.FC<ClientFormScreenProps> = ({ navigation, route }) => {
  const clientId = route.params?.clientId;
  const isEditing = !!clientId;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  // TODO: Add state for other address fields if needed (address_line2, city, state_province, postal_code, country)

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (isEditing && clientId) {
      fetchClientDetails(clientId);
    }
  }, [clientId, isEditing]);

  const fetchClientDetails = async (id: string) => {
    setLoading(true);
    setFormError(null);
    try {
      const { data, error } = await clientService.getClientById(id);
      if (error) {
        setFormError(error.message);
        Alert.alert('Error', `Failed to fetch client details: ${error.message}`);
        setLoading(false);
        return;
      }
      if (data) {
        setName(data.name);
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddressLine1(data.address_line1 || '');
        // TODO: Set other address fields from data if they are added to state
      } else {
        setFormError('Client not found.');
        Alert.alert('Error', 'Client not found.');
      }
    } catch (e) {
      const err = e as Error;
      setFormError(err.message);
      Alert.alert('Error', `An unexpected error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setFormError('Client name is required.');
      Alert.alert('Validation Error', 'Client name cannot be empty.');
      return;
    }
    if (!user) {
      setFormError('User not authenticated. Cannot save client.');
      Alert.alert('Authentication Error', 'You must be logged in to save a client.');
      return;
    }

    setLoading(true);
    setFormError(null);

    // Prepare base data, common to create and update
    const commonData = {
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      address_line1: addressLine1.trim() || null,
      // Set other address fields to null or their state values if added
      address_line2: null,
      city: null,
      state_province: null,
      postal_code: null,
      country: null,
    };

    try {
      if (isEditing && clientId) {
        // For update, user_id is not part of the payload to clientService.updateClient
        const payload: Partial<Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = commonData;
        const { data, error } = await clientService.updateClient(clientId, payload);
        if (error) throw error;
        if (data) {
          Alert.alert('Success', `Client "${data.name}" updated successfully.`);
          navigation.goBack();
        }
      } else {
        // For create, user_id is required.
        const payload: Omit<Client, 'id' | 'created_at' | 'updated_at'> = {
          ...commonData,
          user_id: user.id,
        };
        const { data, error } = await clientService.createClient(payload);
        if (error) throw error;
        if (data) {
          Alert.alert('Success', `Client "${data.name}" added successfully.`);
          // Optionally navigate to the new client's detail screen or refresh list
          navigation.goBack(); 
        }
      }
    } catch (e) {
      const err = e as Error;
      setFormError(err.message);
      Alert.alert('Save Error', `Failed to save client: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing && !name) { 
    return <ScreenContainer><Text style={styles.loadingText}>Loading client details...</Text></ScreenContainer>;
  }

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{isEditing ? 'Edit Client' : 'Add New Client'}</Text>
        
        {formError && <Text style={styles.errorText}>{formError}</Text>}

        <Input label="Client Name *" value={name} onChangeText={setName} placeholder="e.g., Acme Corp" />
        <Input label="Email Address" value={email} onChangeText={setEmail} placeholder="e.g., contact@acme.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="e.g., 555-123-4567" keyboardType="phone-pad" />
        <Input label="Address Line 1" value={addressLine1} onChangeText={setAddressLine1} placeholder="e.g., 123 Main St" />

        <Button 
          title={isEditing ? 'Save Changes' : 'Add Client'} 
          onPress={handleSubmit} 
          loading={loading && !isEditing} // Show loading on button only when submitting new, not when initially loading edit form
          style={styles.submitButton} 
        />
        <Button 
          title="Cancel" 
          onPress={() => navigation.goBack()} 
          variant="outline" 
          style={styles.cancelButton}
          disabled={loading} // Disable cancel if an operation is in progress
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

export default ClientFormScreen; 