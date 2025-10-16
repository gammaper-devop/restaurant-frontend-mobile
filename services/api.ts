import axios from 'axios';
import Constants from 'expo-constants';
import {
  Restaurant,
  Category,
  RestaurantLocation,
  NearbyRestaurantQuery,
  NearbyRestaurantResult,
  ApiResponse,
  Dish,
} from '../types';

// Get API URL from environment or use default for development
const getApiUrl = () => {
  // Try to get from Expo environment variables first
  const envApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  // Fallback to your local IP address
  const developmentUrl = 'http://192.168.100.34:3000/api';
  const productionUrl = Constants.expoConfig?.extra?.apiUrl;
  
  return envApiUrl || productionUrl || developmentUrl;
};

const API_BASE_URL = getApiUrl();

// Log API URL for debugging
if (__DEV__) {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL,
    envUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    timestamp: new Date().toISOString()
  });
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Restaurants Service
export const restaurantService = {
  // Get all restaurants
  getAll: async (): Promise<Restaurant[]> => {
    try {
      const response = await api.get('/restaurants');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data.filter((r: Restaurant) => r.active) : [];
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  },

  // Get restaurant by ID
  getById: async (id: number): Promise<Restaurant> => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  },

  // Search nearby restaurants
  searchNearby: async (query: NearbyRestaurantQuery): Promise<NearbyRestaurantResult[]> => {
    try {
      const { lat, lng, radius = 10 } = query;
      const response = await api.get(`/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error searching nearby restaurants:', error);
      // Fallback: return empty array instead of throwing
      return [];
    }
  },

  // Search nearby with filters
  searchNearbyWithFilters: async (
    query: NearbyRestaurantQuery,
    filters?: { categoryId?: number; isOpen?: boolean }
  ): Promise<NearbyRestaurantResult[]> => {
    try {
      const { lat, lng, radius = 10 } = query;
      let url = `/restaurants/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
      
      if (filters?.categoryId) {
        url += `&categoryId=${filters.categoryId}`;
      }
      
      const response = await api.get(url);
      let results = response.data?.data || response.data || [];
      
      // Filter by open status on client side if needed
      if (filters?.isOpen !== undefined && Array.isArray(results)) {
        results = results.filter((restaurant: any) => 
          restaurant.isCurrentlyOpen === filters.isOpen
        );
      }
      
      return results;
    } catch (error) {
      console.error('Error searching nearby restaurants with filters:', error);
      return [];
    }
  },
};

// Categories Service
export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await api.get('/categories');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data.filter((c: Category) => c.active) : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};

// Restaurant Locations Service
export const restaurantLocationService = {
  getAll: async (): Promise<RestaurantLocation[]> => {
    try {
      const response = await api.get('/restaurants/locations');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data.filter((l: RestaurantLocation) => l.active) : [];
    } catch (error) {
      console.error('Error fetching restaurant locations:', error);
      throw error;
    }
  },

  getByRestaurant: async (restaurantId: number): Promise<RestaurantLocation[]> => {
    try {
      const response = await api.get(`/restaurants/${restaurantId}/locations`);
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data.filter((l: RestaurantLocation) => l.active) : [];
    } catch (error) {
      console.error('Error fetching restaurant locations:', error);
      throw error;
    }
  },

  getCurrentlyOpen: async (): Promise<RestaurantLocation[]> => {
    try {
      const response = await api.get('/restaurants/locations/currently-open');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching currently open locations:', error);
      return [];
    }
  },
};

// Dishes Service
export const dishService = {
  // Get all active dishes
  getAll: async (): Promise<Dish[]> => {
    try {
      const response = await api.get('/dishes');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching dishes:', error);
      return [];
    }
  },

  // Get dish by ID
  getById: async (id: number): Promise<Dish | null> => {
    try {
      const response = await api.get(`/dishes/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching dish:', error);
      return null;
    }
  },

  // Get dishes by restaurant ID
  getByRestaurant: async (restaurantId: number): Promise<Dish[]> => {
    try {
      const response = await api.get(`/dishes/restaurant/${restaurantId}`);
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching dishes by restaurant:', error);
      return [];
    }
  },
};

export default api;
