import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Card from '@/components/common/Card/Card';
import { SettingsStackParamList } from '@/navigation/AppTabs'; // Correct ParamList
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { UserProfile } from '@/types'; // UserProfile from your types
import { colors } from '@/constants/colors';

type ProfileScreenProps = NativeStackScreenProps<SettingsStackParamList, typeof ROUTES.PROFILE>;

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, profile, loading: authLoading, error: authError, clearError } = useAuth();
  const supabase = useSupabase();

  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  // Add other editable profile fields here, e.g., website

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
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
    if (authError) clearError(); // Clear global auth error if any

    const updates: Partial<UserProfile> = {
      id: user.id, // This should typically not be updated by the user directly but is part of the record
      username,
      full_name: fullName,
      avatar_url: avatarUrl,
      // updated_at: new Date().toISOString(), // Supabase handles this automatically
    };

    // try {
    //   const { error: updateError } = await supabase.from('profiles').upsert(updates).select().single();
    //   if (updateError) throw updateError;
    //   setSuccessMessage('Profile updated successfully!');
    //   // Optionally, refresh profile in AuthContext or rely on its existing listeners if set up for 'profiles' table changes.
    // } catch (e) {
    //   setFormError((e as Error).message);
    // } finally {
    //   setLoading(false);
    // }
    Alert.alert('Mock Update', 'Profile update simulated.');
    setSuccessMessage('Profile update simulated successfully!');
    setLoading(false);
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
            {/* Avatar placeholder - In a real app, use an Image component and image picker */}
            <View style={styles.avatarPlaceholder}>
                <Text>{avatarUrl ? 'Avatar Set' : 'No Avatar'}</Text>
            </View>

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
            <Input 
                label="Avatar URL (Optional)"
                value={avatarUrl} 
                onChangeText={setAvatarUrl} 
                placeholder="http://your-avatar.png"
                autoCapitalize="none"
                keyboardType="url"
            />
            {/* Add more inputs for other profile fields */}

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
  avatarPlaceholder: { height: 100, width: 100, borderRadius: 50, backgroundColor: colors.lightGray, justifyContent:'center', alignItems:'center', alignSelf:'center', marginBottom:20 },
  messageText: { textAlign: 'center', padding: 20, fontSize: 16 },
  errorText: { color: colors.error, marginBottom: 15, textAlign: 'center', fontSize: 14 },
  successText: { color: colors.success, marginBottom: 15, textAlign: 'center', fontSize: 14 },
  updateButton: { marginTop: 20 },
});

export default ProfileScreen; 