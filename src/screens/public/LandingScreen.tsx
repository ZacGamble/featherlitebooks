import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Button from '@/components/common/Button/Button';
import { appStrings } from '@/constants/strings';
import { ROUTES } from '@/constants/routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { colors } from '@/constants/colors';

type LandingScreenProps = NativeStackScreenProps<AuthStackParamList, typeof ROUTES.LANDING>;

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>{appStrings.appName}</Text>
          <Text style={styles.subtitle}>Your lightweight business companion, simplified.</Text>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featureBlock}>
            <Text style={styles.featureTitle}>Streamline Your Workflow</Text>
            <Text style={styles.featureText}>
              Manage clients, track inventory, create invoices, and monitor expenses all in one place. FeatherLiteBooks is designed to be intuitive and efficient, saving you time and effort.
            </Text>
          </View>
          <View style={styles.featureBlock}>
            <Text style={styles.featureTitle}>Insights at a Glance</Text>
            <Text style={styles.featureText}>
              Our clean dashboard gives you a clear overview of your business performance. Make informed decisions with easy-to-understand data.
            </Text>
          </View>
          <View style={styles.featureBlock}>
            <Text style={styles.featureTitle}>Accessible Anywhere</Text>
            <Text style={styles.featureText}>
              Whether you're on your desktop or on the go, FeatherLiteBooks keeps your business data synced and accessible.
            </Text>
          </View>
        </View>

        <Button
          title="Get Started"
          onPress={() => navigation.navigate(ROUTES.LOGIN)}
          style={styles.button}
        />
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 FeatherLiteBooks. All rights reserved.
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  featureBlock: {
    marginBottom: 25,
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 8,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    marginBottom: 30,
    width: '80%',
    alignSelf: 'center',
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 