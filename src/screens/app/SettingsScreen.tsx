import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import ListItem from '@/components/common/ListItem/ListItem';
import Button from '@/components/common/Button/Button'; // For Sign Out
import { SettingsStackParamList } from '@/navigation/AppTabs'; // Correct ParamList for Settings stack
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';

type SettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, typeof ROUTES.SETTINGS>;

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { signOut, user } = useAuth();

  // In a real app, these would likely come from a config or be more dynamic
  const settingsOptions = [
    {
      title: 'My Profile',
      icon: 'person-circle-outline' as const,
      route: ROUTES.PROFILE,
      action: () => navigation.navigate(ROUTES.PROFILE),
    },
    {
      title: 'Appearance',
      icon: 'color-palette-outline' as const,
      // route: ROUTES.APPEARANCE_SETTINGS, // Example for a future route
      action: () => console.log('Navigate to Appearance Settings'),
    },
    {
      title: 'Notifications',
      icon: 'notifications-outline' as const,
      // route: ROUTES.NOTIFICATION_SETTINGS,
      action: () => console.log('Navigate to Notification Settings'),
    },
    // {
    //   title: 'Data & Sync',
    //   icon: 'cloud-sync' as const,
    //   action: () => console.log('Navigate to Data & Sync Settings'),
    // },
    {
      title: 'About FeatherLiteBooks',
      icon: 'information-circle-outline' as const,
      // route: ROUTES.ABOUT_APP,
      action: () => console.log('Navigate to About App Screen'),
    },
  ];

  return (
    <ScreenContainer scrollable>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Settings</Text>
        {user?.email && <Text style={styles.userEmailText}>Logged in as: {user.email}</Text>}
        
        <View style={styles.optionsContainer}>
          {settingsOptions.map((option, index) => (
            <ListItem
              key={index}
              title={option.title}
              leftIconName={option.icon}
              leftIconColor={colors.primary}
              onPress={option.action}
              rightIconName="chevron-forward-outline"
              containerStyle={styles.listItemContainer}
            />
          ))}
        </View>

        <Button 
          title="Sign Out"
          onPress={signOut}
          variant="outline"
          style={styles.signOutButton}
          textStyle={styles.signOutButtonText}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    paddingHorizontal: 15, // Match ScreenContainer or ListItem horizontal padding
  },
  userEmailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    paddingHorizontal: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginHorizontal: 10, // Give some horizontal margin to the card-like group
    overflow: 'hidden', // Ensures border radius is applied to ListItems inside
     // Add shadow/elevation if you want a card-like appearance for the group
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listItemContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    // Remove individual item background if optionsContainer has one
    // backgroundColor: 'transparent', 
  },
  signOutButton: {
    marginTop: 30,
    marginHorizontal: 20,
    borderColor: colors.error, 
  },
  signOutButtonText: {
    color: colors.error,
  },
});

export default SettingsScreen; 