import Constants from 'expo-constants';

// Environment configuration
export const ENV = {
  development: {
    apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    enableDebug: true,
    logLevel: 'debug',
    enableMockData: true,
  },
  production: {
    apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-render-app.onrender.com/api',
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://your-render-app.onrender.com',
    enableDebug: false,
    logLevel: 'error',
    enableMockData: false,
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  if (__DEV__) {
    return 'development';
  }
  
  const releaseChannel = Constants.expoConfig?.releaseChannel;
  
  if (releaseChannel === 'production') {
    return 'production';
  }
  
  // Check NODE_ENV from environment variables
  const nodeEnv = process.env.NODE_ENV || 'development';
  return nodeEnv as 'development' | 'production';
};

// Current environment
const currentEnv = getCurrentEnvironment();

// Export configuration
export const config = {
  ...ENV[currentEnv],
  environment: currentEnv,
  appName: process.env.EXPO_PUBLIC_APP_NAME || 'RestaurantOS',
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  isDevelopment: currentEnv === 'development',
  isProduction: currentEnv === 'production',
};

// Logging utility
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (config.enableDebug && config.logLevel === 'debug') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (config.enableDebug || config.logLevel !== 'error') {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};

export default config;