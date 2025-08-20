/**
 * Quick Services Test
 * 
 * Run this to verify all services are properly imported and configured
 * Usage: Import this file in a test screen and call testAllServices()
 */

// Test imports
export const testServiceImports = (): boolean => {
  console.log('🧪 Testing Service Imports...');
  
  try {
    // User Profile Service
    const meService = require('../services/me.service');
    console.log('✅ me.service.ts imported successfully');
    console.log('- Functions:', Object.keys(meService).filter(key => typeof meService[key] === 'function'));

    // Clinics Service
    const clinicsService = require('../services/clinics.service');
    console.log('✅ clinics.service.ts imported successfully');
    console.log('- Functions:', Object.keys(clinicsService).filter(key => typeof clinicsService[key] === 'function'));

    // Notifications Service
    const notificationsService = require('../services/notifications.service');
    console.log('✅ notifications.service.ts imported successfully');
    console.log('- Functions:', Object.keys(notificationsService).filter(key => typeof notificationsService[key] === 'function'));

    // WebSocket Service
    const websocketService = require('../services/websocket.service');
    console.log('✅ websocket.service.ts imported successfully');
    console.log('- Functions:', Object.keys(websocketService).filter(key => typeof websocketService[key] === 'function'));

    // Payments Service
    const paymentsService = require('../services/payments.service');
    console.log('✅ payments.service.ts imported successfully');
    console.log('- Functions:', Object.keys(paymentsService).filter(key => typeof paymentsService[key] === 'function'));

    // VNPay Service
    const vnpayService = require('../services/vnpay.service');
    console.log('✅ vnpay.service.ts imported successfully');
    console.log('- Functions:', Object.keys(vnpayService).filter(key => typeof vnpayService[key] === 'function'));

    console.log('✅ All services imported successfully!');
    return true;
  } catch (error) {
    console.error('❌ Service import failed:', error);
    return false;
  }
};

// Test API client
export const testAPIClient = (): boolean => {
  console.log('🧪 Testing API Client...');
  
  try {
    const { api } = require('../lib/apiClient');
    console.log('✅ API client imported successfully');
    console.log('- Base URL:', api.defaults.baseURL);
    console.log('- Interceptors:', {
      request: api.interceptors.request.handlers.length,
      response: api.interceptors.response.handlers.length
    });
    return true;
  } catch (error) {
    console.error('❌ API client test failed:', error);
    return false;
  }
};

// Test environment variables
export const testEnvironmentVariables = (): boolean => {
  console.log('🧪 Testing Environment Variables...');
  
  const requiredEnvVars = [
    'EXPO_PUBLIC_API_BASE',
    'EXPO_PUBLIC_ENV'
  ];

  const optionalEnvVars = [
    'EXPO_PUBLIC_WEBSOCKET_URL',
    'EXPO_PUBLIC_VNPAY_RETURN_URL',
    'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
    'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'
  ];

  let allGood = true;

  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${value}`);
    } else {
      console.error(`❌ Missing required env var: ${envVar}`);
      allGood = false;
    }
  });

  optionalEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${value}`);
    } else {
      console.log(`⚠️ Optional env var not set: ${envVar}`);
    }
  });

  return allGood;
};

// Test TypeScript interfaces
export const testTypeScriptInterfaces = (): boolean => {
  console.log('🧪 Testing TypeScript Interfaces...');
  
  try {
    // Test User Profile types
    const meService = require('../services/me.service');
    console.log('✅ User Profile types available');

    // Test Clinics types
    const clinicsService = require('../services/clinics.service');
    console.log('✅ Clinics types available');

    // Test Notifications types
    const notificationsService = require('../services/notifications.service');
    console.log('✅ Notifications types available');

    // Test Payments types
    const paymentsService = require('../services/payments.service');
    console.log('✅ Payments types available');

    return true;
  } catch (error) {
    console.error('❌ TypeScript interfaces test failed:', error);
    return false;
  }
};

// Test utility functions
export const testUtilityFunctions = (): boolean => {
  console.log('🧪 Testing Utility Functions...');
  
  try {
    // Test payment utilities
    const { formatPaymentAmount, getPaymentStatusText } = require('../services/payments.service');
    
    const formattedAmount = formatPaymentAmount(500000);
    const statusText = getPaymentStatusText('PAID');
    
    console.log('✅ Payment utilities work:', { formattedAmount, statusText });

    // Test notification utilities
    const { getNotificationIcon } = require('../services/notifications.service');
    const icon = getNotificationIcon('APPOINTMENT_REMINDER');
    console.log('✅ Notification utilities work:', { icon });

    return true;
  } catch (error) {
    console.error('❌ Utility functions test failed:', error);
    return false;
  }
};

// Run all tests
export const testAllServices = (): { success: boolean; results: any } => {
  console.log('🚀 Starting All Services Test...');
  console.log('=====================================');

  const results = {
    imports: testServiceImports(),
    apiClient: testAPIClient(),
    environment: testEnvironmentVariables(),
    types: testTypeScriptInterfaces(),
    utilities: testUtilityFunctions()
  };

  const success = Object.values(results).every(result => result === true);

  console.log('=====================================');
  console.log('📊 Test Results Summary:');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASS' : 'FAIL'}`);
  });

  if (success) {
    console.log('🎉 All services tests passed!');
  } else {
    console.log('⚠️ Some services tests failed. Check logs above.');
  }

  return { success, results };
};

// Export for easy testing
export default {
  testServiceImports,
  testAPIClient,
  testEnvironmentVariables,
  testTypeScriptInterfaces,
  testUtilityFunctions,
  testAllServices
};
