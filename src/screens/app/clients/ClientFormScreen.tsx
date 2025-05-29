import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { ClientStackParamList } from './ClientListScreen'; // Re-use from ClientListScreen
import { ROUTES } from '@/constants/routes';
import { Client } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';
// import * as clientService from '@/api/clientService';

type ClientFormScreenProps = NativeStackScreenProps<ClientStackParamList, typeof ROUTES.CLIENT_FORM>;

export const ClientFormScreen: React.FC<ClientFormScreenProps> = ({ navigation, route }) => {
  const clientId = route.params?.clientId;
  const isEditing = !!clientId;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  // Add other client fields as needed

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (isEditing && clientId) {
      fetchClientDetails(clientId);
    }
  }, [clientId, isEditing]);

  const fetchClientDetails = async (id: string) => {
    setLoading(true);
    setFormError(null);
    // TODO: Replace with actual API call from clientService.ts
    // const { data, error } = await clientService.getClientById(id);
    // if (error) { setFormError(error.message); setLoading(false); return; }
    // if (data) {
    //   setName(data.name);
    //   setEmail(data.email || '');
    //   setPhone(data.phone || '');
    //   setAddress(data.address || '');
    // }
    const MOCK_EDIT_CLIENT: Client = { id: '1', name: 'Editing Global Corp', email: 'edit@globalcorp.com', phone: '555-0199', address: '123 Edit St', user_id: 'mock_user_id', value:'1', label: 'Editing Global Corp' }; // Ensure mock matches Client type
    if (id === '1') { // Simulate finding an item
        setName(MOCK_EDIT_CLIENT.name);
        setEmail(MOCK_EDIT_CLIENT.email || '');
        setPhone(MOCK_EDIT_CLIENT.phone || '');
        setAddress(MOCK_EDIT_CLIENT.address || '');
    } else {
        setFormError('Client not found for editing (mock).');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!name) {
      setFormError('Client name is required.');
      return;
    }
    if (!user) {
        setFormError('User not authenticated. Cannot save client.');
        return;
    }

    setLoading(true);
    setFormError(null);

    const clientData: Omit<Client, 'id' | 'value' | 'label'> & { user_id: string } = {
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      user_id: user.id,
      // Add other fields from state here
    };

    // try {
    //   if (isEditing && clientId) {
    //     await clientService.updateClient(clientId, clientData);
    //   } else {
    //     await clientService.addClient(clientData as Omit<Client, 'id'>); // Cast if addClient expects no user_id in its direct param type but table needs it
    //   }
    //   Alert.alert('Success', `Client ${isEditing ? 'updated' : 'added'} successfully.`);
    //   navigation.goBack();
    // } catch (e) {
    //   setFormError((e as Error).message);
    // } finally {
    //   setLoading(false);
    // }
    Alert.alert('Mock Submit', `Simulated ${isEditing ? 'update' : 'add'} for client: ${name}`);
    setLoading(false);
    navigation.goBack();
  };

  if (loading && isEditing && !name) { 
    return <ScreenContainer><Text style={styles.loadingText}>Loading client details...</Text></ScreenContainer>;
  }

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEditing ? 'Edit Client' : 'Add New Client'}</Text>
        
        {formError && <Text style={styles.errorText}>{formError}</Text>}

        <Input label="Client Name *" value={name} onChangeText={setName} placeholder="e.g., Acme Corp" />
        <Input label="Email Address" value={email} onChangeText={setEmail} placeholder="e.g., contact@acme.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="e.g., 555-123-4567" keyboardType="phone-pad" />
        <Input label="Address" value={address} onChangeText={setAddress} placeholder="e.g., 123 Main St, Anytown" multiline />
        {/* Add more Input fields for other client properties */}

        <Button 
          title={isEditing ? 'Save Changes' : 'Add Client'} 
          onPress={handleSubmit} 
          loading={loading && !isEditing} 
          style={styles.submitButton} 
        />
        <Button 
          title="Cancel" 
          onPress={() => navigation.goBack()} 
          variant="outline" 
          style={styles.cancelButton}
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