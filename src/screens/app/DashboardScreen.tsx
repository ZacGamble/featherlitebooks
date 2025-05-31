import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ScreenContainer from '@/components/layout/ScreenContainer';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { AppTabsParamList } from '@/navigation/AppTabs';
import { ROUTES } from '@/constants/routes';
import { appStrings } from '@/constants/strings';
import { colors } from '@/constants/colors';
import * as dashboardService from '@/api/dashboardService';
import { Ionicons } from '@expo/vector-icons';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import jsPDF from 'jspdf';

type DashboardScreenProps = NativeStackScreenProps<AppTabsParamList, typeof ROUTES.DASHBOARD>;

interface MetricCardData {
  id: string;
  title: string;
  value: string | number | null;
  unit?: string;
  description?: string;
  isLoading: boolean;
  error: string | null;
  isMonetary?: boolean;
  fetcher: (userId: string) => Promise<any>;
}

const formatCurrency = (value: number | null | undefined, defaultCurrency: string | undefined = 'USD') => {
  if (value === null || typeof value === 'undefined') return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: defaultCurrency || 'USD' }).format(value);
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState<MetricCardData[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const hasLoadedForCurrentDepsRef = useRef<boolean>(false);

  const initialMetricsSetup = useCallback((userId: string, defaultCurrency: string | undefined): MetricCardData[] => [
    {
      id: 'totalRevenue',
      title: 'Total Revenue',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      fetcher: dashboardService.getTotalRevenue,
    },
    {
      id: 'totalExpenses',
      title: 'Total Expenses',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      fetcher: dashboardService.getTotalExpenses,
    },
    {
      id: 'netProfitLoss',
      title: 'Net Profit/Loss',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      fetcher: dashboardService.getNetProfitLoss,
    },
    {
      id: 'outstandingReceivables',
      title: 'Outstanding Receivables',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      fetcher: dashboardService.getTotalOutstandingReceivables,
    },
    {
      id: 'averageInvoiceValue',
      title: 'Average Invoice Value',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      fetcher: dashboardService.getAverageInvoiceValue,
    },
    {
      id: 'newInvoicesThisMonth',
      title: 'New Invoices',
      value: null,
      unit: 'Invoices',
      isLoading: true,
      error: null,
      fetcher: (uid) => dashboardService.getNewInvoicesCurrentMonthCount(uid),
    },
    {
      id: 'totalClients',
      title: 'Total Active Clients',
      value: null,
      unit: 'Clients',
      isLoading: true,
      error: null,
      fetcher: dashboardService.getTotalClientsCount,
    },
    {
      id: 'totalInventoryValue',
      title: 'Total Inventory Value',
      value: null,
      isLoading: true,
      error: null,
      isMonetary: true,
      fetcher: dashboardService.getTotalInventoryValue,
    },
  ], []);

  const fetchMetricData = useCallback(async (metric: MetricCardData, userId: string) => {
    setMetrics(prev => prev.map(m => m.id === metric.id ? { ...m, isLoading: true, error: null } : m));
    try {
      const result = await metric.fetcher(userId);
      
      setMetrics(prev => prev.map(m => m.id === metric.id ? { ...m, value: result, isLoading: false } : m));
    } catch (e) {
      const err = e as Error;
      console.error(`Error fetching ${metric.title}:`, err);
      setMetrics(prev => prev.map(m => m.id === metric.id ? { ...m, error: err.message, value: 'Error', isLoading: false } : m));
    }
  }, []);

  const loadAllMetrics = useCallback((currentUserId: string, defaultCurrency: string | undefined) => {
    const initialMetricsData = initialMetricsSetup(currentUserId, defaultCurrency);
    setMetrics(initialMetricsData); 

    initialMetricsData.forEach(metric => {
      fetchMetricData(metric, currentUserId);
    });
  }, [initialMetricsSetup, fetchMetricData]);

  useEffect(() => {
    console.log('DashboardScreen useEffect triggered:',
      {
        userId: user?.id,
        profileDefined: typeof profile !== 'undefined',
        defaultCurrency: profile?.default_currency,
        hasLoadedRef: hasLoadedForCurrentDepsRef.current
      }
    );

    if (user?.id && typeof profile?.default_currency === 'string') {
      if (!hasLoadedForCurrentDepsRef.current) {
        console.log('DashboardScreen: Condition met (user and defaultCurrency string present), calling loadAllMetrics.');
        loadAllMetrics(user.id, profile.default_currency);
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
          userId_cleanup: user?.id,
          defaultCurrency_cleanup: profile?.default_currency
        }
      );
      hasLoadedForCurrentDepsRef.current = false;
    };
  }, [user?.id, profile?.default_currency, loadAllMetrics]);

  const generateSimpleTextReport = (): string => {
    const reportDate = format(new Date(), 'MMMM dd, yyyy HH:mm');
    let reportText = `Dashboard Summary\n`;
    if (profile?.business_name) {
      reportText += `${profile.business_name}\n`;
    }
    reportText += `Generated on: ${reportDate}\n\n`;

    metrics.forEach(metric => {
      let displayValue = 'N/A';
      if (metric.isLoading) {
        displayValue = 'Loading...';
      } else if (metric.error) {
        displayValue = `Error: ${metric.error}`;
      } else if (metric.isMonetary) {
        displayValue = formatCurrency(metric.value as number | null, profile!.default_currency || 'USD');
      } else if (metric.value !== null && typeof metric.value !== 'undefined') {
        displayValue = `${metric.value}${metric.unit ? ' ' + metric.unit : ''}`;
      }
      reportText += `${metric.title}: ${displayValue}\n`;
    });
    return reportText;
  };

  const exportToPdf = async () => {
    if (!profile) {
        Alert.alert('Profile Not Loaded', 'Please wait for your profile to load before exporting.');
        return;
    }
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    const fileName = `Dashboard-${profile.business_name || 'FeatherLite'}-${format(new Date(), 'yyyyMMddHHmmss')}`;

    if (Platform.OS === 'web') {
      try {
        const pdf = new jsPDF();
        pdf.setFontSize(18);
        pdf.text('Dashboard Summary', 14, 22);
        if (profile.business_name) {
          pdf.setFontSize(16);
          pdf.text(profile.business_name, 14, 30);
        }
        pdf.setFontSize(10);
        pdf.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, 14, 36);
        
        let yPos = 50;
        metrics.forEach(metric => {
          if (yPos > 270) { // Basic pagination
            pdf.addPage();
            yPos = 20;
          }
          let displayValue = 'N/A';
          if (metric.isLoading) displayValue = 'Loading...';
          else if (metric.error) displayValue = `Error: ${metric.error}`;
          else if (metric.isMonetary) displayValue = formatCurrency(metric.value as number | null, profile!.default_currency || 'USD');
          else if (metric.value !== null && typeof metric.value !== 'undefined') displayValue = `${metric.value}${metric.unit ? ' ' + metric.unit : ''}`;
          
          pdf.setFontSize(12);
          pdf.text(`${metric.title}:`, 14, yPos);
          pdf.setFontSize(12);
          pdf.text(displayValue, 70, yPos);
          yPos += 7;
        });
        
        pdf.save(`${fileName}.pdf`);
        Alert.alert('PDF Generated', `Dashboard report downloaded as ${fileName}.pdf`);
      } catch (error) {
        console.error('Failed to generate PDF for web', error);
        Alert.alert('Error', 'Could not generate dashboard PDF for web.');
      }
    } else {
      try {
        const htmlContent = `
        <html>
          <head><style>body { font-family: Helvetica, Arial, sans-serif; margin: 25px; } h1 { font-size: 18px; } h2 { font-size: 16px; } p { font-size: 14px; }</style></head>
          <body>
            <h1>Dashboard Summary</h1>
            ${profile.business_name ? `<h2>${profile.business_name}</h2>` : ''}
            <p>Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
            ${metrics.map(metric => {
              let displayValue = 'N/A';
              if (metric.isLoading) displayValue = 'Loading...';
              else if (metric.error) displayValue = `Error: ${metric.error}`;
              else if (metric.isMonetary) displayValue = formatCurrency(metric.value as number | null, profile!.default_currency || 'USD');
              else if (metric.value !== null && typeof metric.value !== 'undefined') displayValue = `${metric.value}${metric.unit ? ' ' + metric.unit : ''}`;
              return `<div style="margin-bottom:10px;"><strong>${metric.title}:</strong> ${displayValue}</div>`;
            }).join('')}
          </body>
        </html>`;

        const options = {
          html: htmlContent,
          fileName: fileName,
          directory: 'Documents',
        };
        const file = await RNHTMLtoPDF.convert(options);
        Alert.alert('PDF Generated', `Dashboard report saved to: ${file.filePath}`);
      } catch (error) {
        console.error('Failed to generate PDF for native', error);
        Alert.alert('Error', 'Could not generate dashboard PDF for native.');
      }
    }
    setIsGeneratingPdf(false);
  };

  const renderMetricCard = (metric: MetricCardData) => {
    let displayValue = 'N/A';
    if (metric.isLoading) {
      displayValue = 'Loading...';
    } else if (metric.error) {
      displayValue = 'Error';
    } else if (metric.isMonetary) {
      displayValue = formatCurrency(metric.value as number | null, profile?.default_currency || 'USD');
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

      <View style={styles.metricsGrid}>
        {metrics.map(metric => renderMetricCard(metric))}
      </View>

      <TouchableOpacity 
        onPress={exportToPdf} 
        style={[styles.actionButton, isGeneratingPdf && styles.actionButtonDisabled]}
        disabled={isGeneratingPdf}
      >
        <Ionicons name={isGeneratingPdf ? "hourglass-outline" : "download-outline"} size={20} color={colors.white} />
        <Text style={styles.actionButtonText}>
          {isGeneratingPdf ? 'Generating PDF...' : 'Export Dashboard to PDF'}
        </Text>
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 100,
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
    flexWrap: 'wrap',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 5,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 15,
    marginVertical: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  actionButtonDisabled: {
    backgroundColor: colors.primaryMuted,
  },
  actionButtonText: {
    color: colors.white,
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  centerMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DashboardScreen; 