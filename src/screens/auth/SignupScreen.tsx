import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Input from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { ROUTES } from '@/constants/routes';
import { signupScreenStrings } from '@/constants/strings';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, typeof ROUTES.SIGNUP>;

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupSuccessful, setSignupSuccessful] = useState(false);
  const { signUpNewUser, loading, error, clearError } = useAuth();

  const handleSignup = async () => {
    if (error) clearError();
    if (password !== confirmPassword) {
      Alert.alert(signupScreenStrings.passwordMismatchErrorTitle, signupScreenStrings.passwordMismatchErrorMessage);
      return;
    }
    const signUpError = await signUpNewUser({ email, password });
    if (signUpError) {
      // Error is already displayed via {error && <Text style={styles.errorText}>{error.message}</Text>}
      // Alert.alert('Signup Failed', signUpError.message); // Optionally remove if context error is sufficient
    } else {
      setSignupSuccessful(true);
      // Alert.alert(
      //   'Signup Successful',
      //   'Please check your email to confirm your account.'
      // );
      // navigation.navigate(ROUTES.LOGIN); // Don't navigate immediately
    }
  };

  if (signupSuccessful) {
    return (
      <ScreenContainer style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={{ width: 28 }} />
          <Text style={styles.title}>{signupScreenStrings.confirmationTitle}</Text>
          <View style={{ width: 28 }} />
        </View>
        <Text style={styles.successMessageText}>
          {signupScreenStrings.confirmationMessagePrefix} 
          <Text style={styles.emailHighlight}>{email}</Text>.
          {signupScreenStrings.confirmationMessageSuffix}
        </Text>
        <Button
          title={signupScreenStrings.proceedToLoginButton}
          onPress={() => navigation.navigate(ROUTES.LOGIN)}
          style={styles.button}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LANDING)} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{signupScreenStrings.title}</Text>
        <View style={{ width: 28 }} />
      </View>

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
    color: colors.primary,
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
  },
  successMessageText: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.text,
    marginBottom: 20,
    lineHeight: 24,
  },
  emailHighlight: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default SignupScreen; 