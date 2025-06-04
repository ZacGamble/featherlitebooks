import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Card from '@/components/common/Card/Card';
import { SettingsStackParamList } from '@/navigation/SettingsStack'; // Correct ParamList
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { UserProfile } from '@/types'; // UserProfile from your types
import { colors } from '@/constants/colors';

type ProfileScreenProps = NativeStackScreenProps<SettingsStackParamList, typeof ROUTES.PROFILE>;

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, profile, loading: authLoading, error: authError, clearError, refreshProfile } = useAuth();
  const supabase = useSupabase();

  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
    }
    if (authError) {
        setFormError(authError.message);
    }
  }, [profile, authError]);

  const handleUpdateProfile = async () => {
    if (!user) {
      setFormError('User not authenticated.');
      return;
    }
    if (!username) {
      setFormError('Username cannot be empty.');
      return;
    }

    setLoading(true);
    setFormError(null);
    setSuccessMessage(null);
    if (authError) clearError();

    const updates: Partial<UserProfile> = {
      id: user.id,
      username,
      full_name: fullName,
    };

    try {
      const { error: updateError } = await supabase.from('profiles').upsert(updates).select().single();
      if (updateError) throw updateError;
      setSuccessMessage('Profile updated successfully!');
      await refreshProfile();
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading && !profile) {
    return <ScreenContainer><Text style={styles.messageText}>Loading profile...</Text></ScreenContainer>;
  }

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My Profile</Text>
        
        <Card style={styles.profileCard}>
            <Text style={styles.emailText}>Email: {user?.email || 'Not available'}</Text>

            {formError && <Text style={styles.errorText}>{formError}</Text>}
            {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

            <Input 
                label="Username *"
                value={username} 
                onChangeText={setUsername} 
                placeholder="Your public display name"
                autoCapitalize="none"
            />
            <Input 
                label="Full Name"
                value={fullName} 
                onChangeText={setFullName} 
                placeholder="Your full name"
            />
            <Button 
                title="Update Profile"
                onPress={handleUpdateProfile} 
                loading={loading} 
                style={styles.updateButton}
            />
        </Card>
        
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 20, textAlign: 'center' },
  profileCard: { padding: 20 },
  emailText: { fontSize: 16, color: colors.textSecondary, marginBottom: 15, textAlign: 'center' },
  messageText: { textAlign: 'center', padding: 20, fontSize: 16 },
  errorText: { color: colors.error, marginBottom: 15, textAlign: 'center', fontSize: 14 },
  successText: { color: colors.success, marginBottom: 15, textAlign: 'center', fontSize: 14 },
  updateButton: { marginTop: 20 },
});

export default ProfileScreen; 