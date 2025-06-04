import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { ROUTES } from '@/constants/routes';
import { useSupabase } from '@/hooks/useSupabase';

type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, typeof ROUTES.FORGOT_PASSWORD>;

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const { loading, error, clearError } = useAuth();
  const supabase = useSupabase();

  const handlePasswordReset = async () => {
    if (error) clearError();
    if (!email) {
      Alert.alert('Input Error', 'Please enter your email address.');
      return;
    }
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: ''
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
        loading={loading}
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

export default ForgotPasswordScreen;