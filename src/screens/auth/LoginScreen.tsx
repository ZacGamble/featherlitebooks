import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { ROUTES } from '@/constants/routes';
import { loginScreenStrings } from '@/constants/strings';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

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
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LANDING)} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{loginScreenStrings.title}</Text>
        <View style={{ width: 28 }} />
      </View>
      
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
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
    color: colors.error,
    textAlign: 'center',
    marginBottom: 10,
  }
}); 