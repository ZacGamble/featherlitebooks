import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack'; // Or BottomTabScreenProps if used directly in tabs
import ScreenContainer from '@/components/layout/ScreenContainer';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { AppTabsParamList } from '@/navigation/AppTabs'; // Corrected import
import { ROUTES } from '@/constants/routes';
import { appStrings } from '@/constants/strings';
import { colors } from '@/constants/colors';
import * as dashboardService from '@/api/dashboardService';
import { Ionicons } from '@expo/vector-icons';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// If Dashboard is a direct screen in AppTabs, use BottomTabScreenProps
// from '@react-navigation/bottom-tabs'. If it's part of a stack within a tab, adjust accordingly.
// For this example, assuming it could be navigated to from various places or is a simple tab screen.
// Using AppTabParamList which is defined in AppTabs.tsx
type DashboardScreenProps = NativeStackScreenProps<AppTabsParamList, typeof ROUTES.DASHBOARD>;

// Define the structure for each metric card
interface MetricCardData {
  id: string;
  title: string;
  value: string | number | null;
  unit?: string; // e.g., 'USD', 'Clients', 'Items'
  description?: string; // For more complex data like top item name
  isLoading: boolean;
  error: string | null;
  isMonetary?: boolean;
  showDatePicker?: boolean; // To indicate if this metric uses date range
  fetcher: (userId: string, startDate?: string, endDate?: string) => Promise<any>;
}

const formatDateForSupabase = (date: Date): string => format(date, 'yyyy-MM-dd');

// Helper to format currency
const formatCurrency = (value: number | null | undefined, defaultCurrency: string | undefined = 'USD') => {
  if (value === null || typeof value === 'undefined') return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: defaultCurrency || 'USD' }).format(value);
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, profile, signOut } = useAuth();
  const [metrics, setMetrics] = useState<MetricCardData[]>([]);
  const [globalStartDate, setGlobalStartDate] = useState<Date>(startOfMonth(new Date()));
  const [globalEndDate, setGlobalEndDate] = useState<Date>(endOfMonth(new Date()));
  const [tempStartDate, setTempStartDate] = useState<string>(formatDateForSupabase(globalStartDate));
  const [tempEndDate, setTempEndDate] = useState<string>(formatDateForSupabase(globalEndDate));
  
  // Ref to track if initial metrics for the current dep set have been loaded
  const hasLoadedForCurrentDepsRef = useRef<boolean>(false);

  const initialMetricsSetup = useCallback((userId: string, defaultCurrency: string | undefined): MetricCardData[] => [
    {
      id: 'totalRevenue',
      title: 'Total Revenue',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      showDatePicker: true,
      fetcher: dashboardService.getTotalRevenue,
    },
    {
      id: 'totalExpenses',
      title: 'Total Expenses',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      showDatePicker: true,
      fetcher: dashboardService.getTotalExpenses,
    },
    {
      id: 'netProfitLoss',
      title: 'Net Profit/Loss',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      showDatePicker: true,
      fetcher: dashboardService.getNetProfitLoss,
    },
    {
      id: 'outstandingReceivables',
      title: 'Outstanding Receivables',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      showDatePicker: true, // Assuming filtering by invoice date is desired
      fetcher: dashboardService.getTotalOutstandingReceivables,
    },
    {
      id: 'averageInvoiceValue',
      title: 'Average Invoice Value',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      showDatePicker: true,
      fetcher: dashboardService.getAverageInvoiceValue,
    },
    {
      id: 'newInvoicesThisMonth',
      title: 'New Invoices (This Month)',
      value: null,
      unit: 'Invoices',
      isLoading: true,
      error: null,
      showDatePicker: false, // This metric is specific to current month by its RPC name
      fetcher: (uid) => dashboardService.getNewInvoicesCurrentMonthCount(uid),
    },
    {
      id: 'totalClients',
      title: 'Total Active Clients',
      value: null,
      unit: 'Clients',
      isLoading: true,
      error: null,
      showDatePicker: false,
      fetcher: dashboardService.getTotalClientsCount,
    },
    {
      id: 'totalInventoryValue',
      title: 'Total Inventory Value',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      showDatePicker: false,
      fetcher: dashboardService.getTotalInventoryValue,
    },
  ], []);

  const fetchMetricData = useCallback(async (metric: MetricCardData, userId: string, startDate: string, endDate: string) => {
    setMetrics(prev => prev.map(m => m.id === metric.id ? { ...m, isLoading: true, error: null } : m));
    try {
      const result = metric.showDatePicker 
        ? await metric.fetcher(userId, startDate, endDate) 
        : await metric.fetcher(userId);
      
      setMetrics(prev => prev.map(m => m.id === metric.id ? { ...m, value: result, isLoading: false } : m));
    } catch (e) {
      const err = e as Error;
      console.error(`Error fetching ${metric.title}:`, err);
      setMetrics(prev => prev.map(m => m.id === metric.id ? { ...m, error: err.message, value: 'Error', isLoading: false } : m));
    }
  }, []);

  const loadAllMetrics = useCallback((currentUserId: string, currentStartDate: Date, currentEndDate: Date, defaultCurrency: string | undefined) => {
    const sd = formatDateForSupabase(currentStartDate);
    const ed = formatDateForSupabase(currentEndDate);
    const initialMetricsData = initialMetricsSetup(currentUserId, defaultCurrency);
    setMetrics(initialMetricsData); 

    initialMetricsData.forEach(metric => {
      fetchMetricData(metric, currentUserId, sd, ed);
    });
  }, [initialMetricsSetup, fetchMetricData]);

  useEffect(() => {
    // Log current state of dependencies EACH time this effect callback runs
    console.log('DashboardScreen useEffect triggered:',
      {
        userId: user?.id,
        profileDefined: typeof profile !== 'undefined',
        defaultCurrency: profile?.default_currency,
        startDate: globalStartDate.toISOString(),
        endDate: globalEndDate.toISOString(),
        // loadAllMetrics ref will be the same unless component remounts, so not logging it.
        hasLoadedRef: hasLoadedForCurrentDepsRef.current
      }
    );

    if (user?.id && typeof profile?.default_currency === 'string') {
      if (!hasLoadedForCurrentDepsRef.current) {
        console.log('DashboardScreen: Condition met (user and defaultCurrency string present), calling loadAllMetrics.');
        loadAllMetrics(user.id, globalStartDate, globalEndDate, profile.default_currency);
        hasLoadedForCurrentDepsRef.current = true;
      } else {
        console.log('DashboardScreen: Condition met, but hasLoadedRef is true, skipping loadAllMetrics.');
      }
    } else {
      console.log('DashboardScreen: Condition NOT met (user or profile.default_currency not ready).', {
        userId: user?.id,
        profileExists: !!profile,
        defaultCurrency: profile?.default_currency,
        isDefaultCurrencyString: typeof profile?.default_currency === 'string'
      });
    }

    return () => {
      console.log('DashboardScreen: useEffect cleanup - resetting hasLoadedForCurrentDepsRef.current to false.',
        {
          // Optional: Log deps again to see what they were when cleanup was scheduled
          userId_cleanup: user?.id,
          defaultCurrency_cleanup: profile?.default_currency
        }
      );
      hasLoadedForCurrentDepsRef.current = false;
    };
  }, [user?.id, globalStartDate, globalEndDate, profile?.default_currency, loadAllMetrics]);

  const handleApplyDateFilter = () => {
    try {
        const newStartDate = new Date(tempStartDate + 'T00:00:00'); // Ensure parsing in local timezone context
        const newEndDate = new Date(tempEndDate + 'T23:59:59');
        if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
            alert('Invalid date format. Please use YYYY-MM-DD.');
            return;
        }
        if (newEndDate < newStartDate) {
            alert('End date cannot be earlier than start date.');
            return;
        }
        setGlobalStartDate(newStartDate);
        setGlobalEndDate(newEndDate);
    } catch (error) {
        alert('Error parsing dates. Please use YYYY-MM-DD format.');
    }
  };

  const setDateRangePreset = (preset: 'month' | 'year') => {
    let newStart: Date, newEnd: Date;
    if (preset === 'month') {
        newStart = startOfMonth(new Date());
        newEnd = endOfMonth(new Date());
    } else { // year
        newStart = startOfYear(new Date());
        newEnd = endOfYear(new Date());
    }
    setTempStartDate(formatDateForSupabase(newStart));
    setTempEndDate(formatDateForSupabase(newEnd));
    setGlobalStartDate(newStart);
    setGlobalEndDate(newEnd);
  };

  const renderMetricCard = (metric: MetricCardData) => {
    let displayValue = 'N/A';
    if (metric.isLoading) {
      displayValue = 'Loading...';
    } else if (metric.error) {
      displayValue = 'Error';
    } else if (metric.id === 'topSellingItem' || metric.id === 'topExpenseCategory') {
      displayValue = typeof metric.value === 'string' ? metric.value : 'N/A';
    } else if (metric.isMonetary) {
      displayValue = formatCurrency(metric.value as number | null, profile?.default_currency ?? undefined);
    } else if (metric.value !== null && typeof metric.value !== 'undefined') {
      displayValue = `${metric.value}${metric.unit ? ' ' + metric.unit : ''}`;
    }

    return (
      <View key={metric.id} style={styles.card}>
        <Text style={styles.cardTitle}>{metric.title}</Text>
        {metric.isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.valueText} />
        ) : (
          <Text style={styles.valueText}>{displayValue}</Text>
        )}
        {metric.error && <Text style={styles.errorText}>{metric.error}</Text>}
      </View>
    );
  };
  
  if (!user) {
    return (
        <ScreenContainer>
            <View style={styles.centerMessageContainer}>
                <Text>Please log in to view the dashboard.</Text>
            </View>
        </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Welcome, {profile?.business_name || profile?.username || user?.email || 'User'}!</Text>
        <Text style={styles.subtitle}>Your Financial Overview</Text>
      </View>

      <View style={styles.dateFilterContainer}>
        <Text style={styles.dateLabel}>Start Date:</Text>
        <TextInput 
            style={styles.dateInput} 
            value={tempStartDate} 
            onChangeText={setTempStartDate} 
            placeholder="YYYY-MM-DD"
        />
        <Text style={styles.dateLabel}>End Date:</Text>
        <TextInput 
            style={styles.dateInput} 
            value={tempEndDate} 
            onChangeText={setTempEndDate} 
            placeholder="YYYY-MM-DD"
        />
        <TouchableOpacity style={styles.filterButton} onPress={handleApplyDateFilter}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} />
            <Text style={styles.filterButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.presetButtonsContainer}>
        <TouchableOpacity style={styles.presetButton} onPress={() => setDateRangePreset('month')}>
            <Text style={styles.presetButtonText}>This Month</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.presetButton} onPress={() => setDateRangePreset('year')}>
            <Text style={styles.presetButtonText}>This Year</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map(metric => renderMetricCard(metric))}
      </View>

      <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
    paddingHorizontal: 5,
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
    marginBottom: 20,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
    flexWrap: 'wrap', // Allow wrapping on smaller screens
  },
  dateLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 5,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    marginRight: 10,
    backgroundColor: colors.inputBackground, // Added from ClientListScreen
    color: colors.text,
    minWidth: 100, // Ensure input is wide enough
  },
  filterButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  presetButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  presetButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  presetButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 15,
    width: '48%', // Two cards per row with a little space
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 100, // Ensure cards have some minimum height
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    flexWrap: 'wrap', // allow wrapping for long strings like top item
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 5,
    textAlign: 'center',
  },
  signOutButton: {
    marginTop: 30,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorBackground, // Added from ClientListScreen
  },
  signOutButtonText: {
    color: colors.error,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  centerMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen; 