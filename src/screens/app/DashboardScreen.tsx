import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack'; // Or BottomTabScreenProps if used directly in tabs
import ScreenContainer from '@/components/layout/ScreenContainer';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { AppTabParamList } from '@/navigation/AppTabs'; // Assuming this is the correct param list
import { ROUTES } from '@/constants/routes';
import { appStrings } from '@/constants/strings';
import { colors } from '@/constants/colors';

// If Dashboard is a direct screen in AppTabs, use BottomTabScreenProps
// from '@react-navigation/bottom-tabs'. If it's part of a stack within a tab, adjust accordingly.
// For this example, assuming it could be navigated to from various places or is a simple tab screen.
// Using AppTabParamList which is defined in AppTabs.tsx
type DashboardScreenProps = NativeStackScreenProps<AppTabParamList, typeof ROUTES.DASHBOARD>;

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, profile, signOut } = useAuth();

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Welcome, {profile?.username || user?.email || 'User'}!</Text>
        <Text style={styles.subtitle}>This is your {appStrings.appName} Dashboard.</Text>
      </View>

      <Card style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Quick Summary</Text>
        <Text style={styles.cardText}>- Placeholder for key metrics (e.g., pending invoices, low stock items).</Text>
        <Text style={styles.cardText}>- Quick navigation links.</Text>
      </Card>

      <Card style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <Button 
          title="New Invoice" 
          onPress={() => navigation.navigate(ROUTES.INVOICES_STACK, { screen: ROUTES.INVOICE_FORM })} 
          style={styles.actionButton} 
        />
        <Button 
          title="Add Inventory Item" 
          onPress={() => navigation.navigate(ROUTES.INVENTORY_STACK, { screen: ROUTES.INVENTORY_FORM })} 
          style={styles.actionButton} 
        />
        <Button 
          title="Record Expense" 
          onPress={() => navigation.navigate(ROUTES.EXPENSES_STACK, { screen: ROUTES.EXPENSE_FORM })} 
          style={styles.actionButton} 
        />
      </Card>

      {/* Add more sections/cards as needed for alerts, recent activity, etc. */}

      <Button title="Sign Out" onPress={signOut} variant="outline" style={styles.signOutButton} />

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
    paddingHorizontal: 5, // Adjust as ScreenContainer has its own padding
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryCard: {
    marginBottom: 20,
  },
  actionsCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: colors.primary,
  },
  cardText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  actionButton: {
    marginBottom: 10,
  },
  signOutButton: {
    marginTop: 20,
    borderColor: colors.error,
  },
});

export default DashboardScreen; 