import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth provides a password reset function
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { ROUTES } from '@/constants/routes';
import { useSupabase } from '@/hooks/useSupabase'; // Import useSupabase
// import { appStrings } from '@/constants/strings'; // Add specific strings if needed

type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, typeof ROUTES.FORGOT_PASSWORD>;

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const { loading, error, clearError } = useAuth(); // Destructure only what's needed, add resetPassword if available
  const { supabase } = useSupabase(); // Direct Supabase access for password reset

  const handlePasswordReset = async () => {
    if (error) clearError(); // Assuming clearError is from useAuth and general
    if (!email) {
      Alert.alert('Input Error', 'Please enter your email address.');
      return;
    }
    
    // Using supabase client directly for password reset for now
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: '' // Add your password reset redirect URL here if needed, otherwise it uses Supabase settings
    });

    if (resetError) {
      Alert.alert('Password Reset Error', resetError.message);
    } else {
      Alert.alert(
        'Password Reset Requested',
        'If an account exists for this email, a password reset link has been sent.'
      );
      navigation.navigate(ROUTES.LOGIN);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      {/* General error from useAuth, if applicable to this screen's operations */}
      {error && <Text style={styles.errorText}>{error.message}</Text>}
      <Input
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        containerStyle={styles.inputContainer}
      />
      <Button
        title="Send Reset Link"
        onPress={handlePasswordReset}
        loading={loading} // This loading might be from general useAuth, or you might want a specific one
        style={styles.button}
      />
      <Button
        title="Back to Login"
        onPress={() => navigation.navigate(ROUTES.LOGIN)}
        variant="ghost"
        style={styles.linkButton}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
  linkButton: {
    marginTop: 15,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default ForgotPasswordScreen; // Added default export 