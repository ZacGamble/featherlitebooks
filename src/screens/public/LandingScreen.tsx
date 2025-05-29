import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/common/Button/Button';
import { APP_STRINGS } from '@/constants/strings';
import { ROUTES } from '@/constants/routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator'; // Assuming this navigator handles routes after landing

type LandingScreenProps = NativeStackScreenProps<AuthStackParamList, typeof ROUTES.AUTH.LOGIN>; // Or a dedicated PublicStackParamList

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>{APP_STRINGS.appName}</Text>
        <Text style={styles.subtitle}>Welcome to your lightweight business companion.</Text>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate(ROUTES.AUTH.LOGIN)} // Or Signup
          style={styles.button}
        />
        <Button
          title="Learn More"
          onPress={() => console.log('Learn More Pressed')}
          variant="outline"
          style={styles.button}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    marginTop: 15,
    width: '80%',
  },
}); 