import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Import test functions
import servicesTest from '../tests/services.quick-test';
import criticalFlowsTest from '../tests/critical-flows.test';
import edgeCasesTest from '../tests/edge-cases.test';
import performanceTest from '../tests/performance.analysis';

interface TestScreenProps {
  onNavigateBack?: () => void;
}

export default function TestScreen({ onNavigateBack }: TestScreenProps) {
  const [testResults, setTestResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const runServicesTest = async () => {
    setIsRunning(true);
    try {
      console.log('🧪 Running Services Test...');
      const result = servicesTest.testAllServices();
      setTestResults(prev => ({ ...prev, services: result }));
      
      Alert.alert(
        'Services Test Complete',
        `Success: ${result.success}\nCheck console for details`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Services test failed:', error);
      Alert.alert('Test Failed', 'Check console for error details');
    } finally {
      setIsRunning(false);
    }
  };

  const runCriticalFlowsTest = () => {
    setIsRunning(true);
    try {
      console.log('🧪 Running Critical Flows Test...');
      const result = criticalFlowsTest.executeTestPlan();
      setTestResults(prev => ({ ...prev, criticalFlows: result }));
      
      Alert.alert(
        'Critical Flows Test Plan Loaded',
        `Total scenarios: ${result.plan.totalScenarios}\nCheck console for test plan`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Critical flows test failed:', error);
      Alert.alert('Test Failed', 'Check console for error details');
    } finally {
      setIsRunning(false);
    }
  };

  const runEdgeCasesTest = () => {
    setIsRunning(true);
    try {
      console.log('🧪 Running Edge Cases Test...');
      const result = edgeCasesTest.executeEdgeCaseTests();
      setTestResults(prev => ({ ...prev, edgeCases: result }));
      
      Alert.alert(
        'Edge Cases Test Plan Loaded',
        `Total tests: ${result.plan.totalTests}\nCheck console for test plan`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Edge cases test failed:', error);
      Alert.alert('Test Failed', 'Check console for error details');
    } finally {
      setIsRunning(false);
    }
  };

  const runPerformanceTest = () => {
    setIsRunning(true);
    try {
      console.log('🧪 Running Performance Analysis...');
      const result = performanceTest.executePerformanceAnalysis();
      setTestResults(prev => ({ ...prev, performance: result }));
      
      Alert.alert(
        'Performance Analysis Complete',
        'Check console for performance recommendations',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Performance test failed:', error);
      Alert.alert('Test Failed', 'Check console for error details');
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults({});
    console.clear();
    Alert.alert('Results Cleared', 'Test results and console cleared');
  };

  const testButtons = [
    {
      title: 'Test Services',
      description: 'Test all service imports and basic functionality',
      onPress: runServicesTest,
      icon: 'build',
      color: '#007AFF'
    },
    {
      title: 'Critical Flows',
      description: 'Load critical user flow test scenarios',
      onPress: runCriticalFlowsTest,
      icon: 'account-tree',
      color: '#34C759'
    },
    {
      title: 'Edge Cases',
      description: 'Load edge case and error handling tests',
      onPress: runEdgeCasesTest,
      icon: 'warning',
      color: '#FF9500'
    },
    {
      title: 'Performance',
      description: 'Run performance analysis and recommendations',
      onPress: runPerformanceTest,
      icon: 'speed',
      color: '#AF52DE'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Testing</Text>
        <TouchableOpacity onPress={clearResults} style={styles.clearButton}>
          <MaterialIcons name="clear" size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>🧪 Testing Instructions</Text>
          <Text style={styles.instructionsText}>
            1. Run tests one by one{'\n'}
            2. Check console output for detailed results{'\n'}
            3. Test results will show in alerts{'\n'}
            4. Use Clear button to reset results
          </Text>
        </View>

        {/* Test Buttons */}
        {testButtons.map((test, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.testButton, { borderLeftColor: test.color }]}
            onPress={test.onPress}
            disabled={isRunning}
          >
            <View style={styles.testButtonContent}>
              <View style={[styles.testIcon, { backgroundColor: test.color }]}>
                <MaterialIcons name={test.icon as any} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.testInfo}>
                <Text style={styles.testTitle}>{test.title}</Text>
                <Text style={styles.testDescription}>{test.description}</Text>
              </View>
              <MaterialIcons 
                name="chevron-right" 
                size={20} 
                color={isRunning ? "#9CA3AF" : "#6B7280"} 
              />
            </View>
          </TouchableOpacity>
        ))}

        {/* Results Summary */}
        {Object.keys(testResults).length > 0 && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>📊 Test Results Summary</Text>
            {Object.entries(testResults).map(([testName, result]: [string, any]) => (
              <View key={testName} style={styles.resultItem}>
                <Text style={styles.resultName}>{testName}</Text>
                <Text style={styles.resultStatus}>
                  {result.success !== undefined 
                    ? (result.success ? '✅ PASS' : '❌ FAIL')
                    : '📋 LOADED'
                  }
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Status */}
        {isRunning && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>🔄 Running test... Check console for output</Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  clearButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  instructionsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#0369A1',
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  testButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  testIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
    marginRight: 8,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  resultsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultName: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 50,
  },
});
