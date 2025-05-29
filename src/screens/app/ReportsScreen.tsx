import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack'; // Or BottomTabScreenProps
import ScreenContainer from '@/components/layout/ScreenContainer';
import { AppTabParamList } from '@/navigation/AppTabs'; // Adjust if needed
import { ROUTES } from '@/constants/routes';
import { colors } from '@/constants/colors';

// Assuming Reports is a direct screen in AppTabs or a similar stack
type ReportsScreenProps = NativeStackScreenProps<AppTabParamList, typeof ROUTES.REPORTS>;

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ navigation }) => {
  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.placeholderText}>
        This screen will provide various financial and operational reports.
      </Text>
      <Text style={styles.placeholderText}>
        - Profit & Loss Statement
        {/* \n - Sales Summary (by client, product/service) */}
        {/* \n - Expense Summary (by category, vendor) */}
        {/* \n - Inventory Valuation */}
        {/* \n - Tax Reports (placeholder) */}
      </Text>
      <Text style={styles.comingSoonText}>
        Report generation and filtering options are coming soon!
      </Text>
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
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 24,
  },
  comingSoonText: {
    fontSize: 18,
    color: colors.accent,
    marginTop: 20,
    fontWeight: '500',
  },
});

export default ReportsScreen; 