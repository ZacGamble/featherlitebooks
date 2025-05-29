import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { ROUTES } from '@/constants/routes';
import { appStrings, loginScreenStrings } from '@/constants/strings';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, typeof ROUTES.LOGIN>;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithPassword, loading, error, clearError } = useAuth();

  const handleLogin = async () => {
    if (error) clearError();
    const signInError = await signInWithPassword({ email, password });
    if (signInError) {
      Alert.alert(loginScreenStrings.loginErrorTitle || 'Login Failed', signInError.message);
    }
    // Navigation to AppTabs will be handled by AuthContext state change via AppNavigator
  };

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>{loginScreenStrings.title}</Text>
      {error && <Text style={styles.errorText}>{error.message}</Text>}
      <Input
        placeholder={loginScreenStrings.emailPlaceholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        containerStyle={styles.inputContainer}
      />
      <Input
        placeholder={loginScreenStrings.passwordPlaceholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={styles.inputContainer}
      />
      <Button
        title={loginScreenStrings.loginButton}
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      />
      <Button
        title={loginScreenStrings.forgotPasswordButton}
        onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
        variant="ghost"
        style={styles.linkButton}
      />
      <Button
        title={loginScreenStrings.signupButton}
        onPress={() => navigation.navigate(ROUTES.SIGNUP)}
        variant="outline"
        style={styles.button}
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
  }
}); 