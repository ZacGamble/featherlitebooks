import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { ROUTES } from '@/constants/routes';
import { signupScreenStrings } from '@/constants/strings';
// import { commonStyles } from '@/styles/common';

type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, typeof ROUTES.SIGNUP>;

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUpNewUser, loading, error, clearError } = useAuth();

  const handleSignup = async () => {
    if (error) clearError();
    if (password !== confirmPassword) {
      Alert.alert('Signup Error', 'Passwords do not match.');
      return;
    }
    const signUpError = await signUpNewUser({ email, password });
    if (signUpError) {
      Alert.alert('Signup Failed', signUpError.message);
    } else {
      Alert.alert(
        'Signup Successful',
        'Please check your email to confirm your account.'
      );
      // Navigation to login or directly to app (after confirmation) can be handled here
      // or by AppNavigator based on auth state changes.
      // For now, let's navigate to login after signup attempt.
      navigation.navigate(ROUTES.LOGIN);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>{signupScreenStrings.title}</Text>
      {error && <Text style={styles.errorText}>{error.message}</Text>}
      <Input
        placeholder={signupScreenStrings.emailPlaceholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        containerStyle={styles.inputContainer}
      />
      <Input
        placeholder={signupScreenStrings.passwordPlaceholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={styles.inputContainer}
      />
      <Input
        placeholder={signupScreenStrings.confirmPasswordPlaceholder}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        containerStyle={styles.inputContainer}
      />
      <Button
        title={signupScreenStrings.signupButton}
        onPress={handleSignup}
        loading={loading}
        style={styles.button}
      />
      <Button
        title={signupScreenStrings.loginPrompt}
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
    marginBottom: 15,
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

export default SignupScreen; 