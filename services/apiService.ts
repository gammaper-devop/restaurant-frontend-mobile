import axios from 'axios';
import { ApiResponse, Category, Restaurant } from '../types';

// Configure your backend URL here
// For development: Use localhost or your actual backend URL
// For production: Use your production API URL
const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your actual backend URL

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging (optional)
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('🔴 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('🔴 API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Get nearby restaurants based on location and radius
   * @param latitude User's latitude
   * @param longitude User's longitude
   * @param radiusKm Search radius in kilometers
   * @returns Array of restaurants
   */
  async getNearbyRestaurants(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<Restaurant[]> {
    try {
      const response = await api.get<ApiResponse<Restaurant[]>>('/restaurants/nearby', {
        params: {
          lat: latitude,
          lng: longitude,
          radius: radiusKm,
        },
      });

      return response.data.data || [];
    } catch (error) {
      // For development/testing, return mock data if API is not available
      console.warn('⚠️ API not available, returning mock data');
      return this.getMockRestaurants(latitude, longitude);
    }
  }

  /**
   * Get all available restaurant categories
   * @returns Array of categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      return response.data.data || [];
    } catch (error) {
      console.warn('⚠️ API not available, returning mock categories');
      return this.getMockCategories();
    }
  }

  /**
   * Get all restaurant locations
   * @returns Array of locations with restaurant data
   */
  async getLocations(): Promise<Restaurant[]> {
    try {
      const response = await api.get<ApiResponse<Restaurant[]>>('/locations');
      return response.data.data || [];
    } catch (error) {
      console.warn('⚠️ API not available, returning mock locations');
      return this.getMockRestaurants();
    }
  }

  /**
   * Get restaurant by ID
   * @param id Restaurant ID
   * @returns Restaurant data
   */
  async getRestaurantById(id: number): Promise<Restaurant | null> {
    try {
      const response = await api.get<ApiResponse<Restaurant>>(`/restaurants/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.warn('⚠️ API not available, returning mock restaurant data');
      // Return mock restaurant from our mock data
      const mockRestaurants = this.getMockRestaurants();
      return mockRestaurants.find(restaurant => restaurant.id === id) || null;
    }
  }

  /**
   * Get restaurants by category ID
   * @param categoryId Category ID to filter by
   * @param latitude User's latitude (optional)
   * @param longitude User's longitude (optional)
   * @returns Array of restaurants
   */
  async getRestaurantsByCategory(
    categoryId: number,
    latitude?: number,
    longitude?: number
  ): Promise<Restaurant[]> {
    try {
      // Use the specific category endpoint from backend
      const response = await api.get<ApiResponse<Restaurant[]>>(`/restaurants/category/${categoryId}`, {
        params: {
          includeInactive: 'false' // Only get active restaurants
        }
      });

      const restaurants = response.data.data || [];
      console.log(`🍽️ Found ${restaurants.length} restaurants for category ID: ${categoryId}`);
      return restaurants;
    } catch (error) {
      console.warn(`⚠️ API not available, filtering mock data by category ID: ${categoryId}`);
      // Filter mock restaurants by category ID
      const mockRestaurants = this.getMockRestaurants(latitude, longitude);
      const filteredResults = mockRestaurants.filter(restaurant => {
        if (!restaurant || !categoryId) return false;
        
        // Since mock data doesn't have categoryId, we'll match by category name
        // This is a fallback approach for development
        const mockCategories = this.getMockCategories();
        const category = mockCategories.find(cat => cat.id === categoryId);
        
        if (!category) return false;
        
        const cuisine = (restaurant.cuisine || '').toLowerCase();
        const name = (restaurant.name || '').toLowerCase();
        const description = (restaurant.description || '').toLowerCase();
        const categoryName = category.name.toLowerCase();
        
        return cuisine.includes(categoryName) || 
               name.includes(categoryName) || 
               description.includes(categoryName);
      });
      
      console.log(`📍 Found ${filteredResults.length} mock restaurants for category ID: ${categoryId}`);
      return filteredResults;
    }
  }

  /**
   * Search restaurants by name or category
   * @param query Search query
   * @param latitude User's latitude (optional)
   * @param longitude User's longitude (optional)
   * @returns Array of restaurants
   */
  async searchRestaurants(
    query: string,
    latitude?: number,
    longitude?: number
  ): Promise<Restaurant[]> {
    try {
      const params: any = { q: query };
      if (latitude && longitude) {
        params.lat = latitude;
        params.lng = longitude;
      }

      const response = await api.get<ApiResponse<Restaurant[]>>('/restaurants/search', {
        params,
      });

      return response.data.data || [];
    } catch (error) {
      console.error('Failed to search restaurants:', error);
      return [];
    }
  }

  /**
   * Mock data for development/testing when API is not available
   */
  private getMockRestaurants(userLat?: number, userLng?: number): Restaurant[] {
    const baseRestaurants: Restaurant[] = [
      {
        id: 1,
        name: 'The Burger Joint',
        cuisine: 'American',
        rating: 4.8,
        address: '123 Madison Ave, Manhattan',
        phone: '+1-555-0123',
        latitude: userLat ? userLat + 0.01 : 40.7489,
        longitude: userLng ? userLng + 0.01 : -73.9857,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        priceRange: '$$',
        isOpen: true,
        openingHours: '25-35 min',
        description: 'Burgers • Salads',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 2,
        name: 'Sakura Sushi',
        cuisine: 'Japanese',
        rating: 4.9,
        address: '456 East 42nd St, Midtown',
        phone: '+1-555-0456',
        latitude: userLat ? userLat + 0.005 : 40.7505,
        longitude: userLng ? userLng - 0.005 : -73.9851,
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        priceRange: '$$$',
        isOpen: true,
        openingHours: '20-30 min',
        description: 'Sushi • Japanese',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 3,
        name: 'Bella Vista',
        cuisine: 'Italian',
        rating: 4.7,
        address: '789 Little Italy St, SoHo',
        phone: '+1-555-0789',
        latitude: userLat ? userLat - 0.008 : 40.7614,
        longitude: userLng ? userLng + 0.012 : -73.9776,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        priceRange: '$$$',
        isOpen: false,
        openingHours: '30-45 min',
        description: 'Pizza • Pasta • Italian',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 4,
        name: 'Dragon Palace',
        cuisine: 'Chinese',
        rating: 4.5,
        address: '321 Chinatown Ave, Lower Manhattan',
        phone: '+1-555-0321',
        latitude: userLat ? userLat + 0.015 : 40.7330,
        longitude: userLng ? userLng - 0.010 : -73.9950,
        imageUrl: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=300&fit=crop',
        priceRange: '$$',
        isOpen: true,
        openingHours: '15-25 min',
        description: 'Chinese • Dim Sum',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 5,
        name: 'Taco Libre',
        cuisine: 'Mexican',
        rating: 4.6,
        address: '654 Broadway, Greenwich Village',
        phone: '+1-555-0654',
        latitude: userLat ? userLat - 0.005 : 40.7282,
        longitude: userLng ? userLng + 0.008 : -73.9942,
        imageUrl: 'https://images.unsplash.com/photo-1565299585323-38174c11f48a?w=400&h=300&fit=crop',
        priceRange: '$',
        isOpen: true,
        openingHours: '10-20 min',
        description: 'Mexican • Tacos • Burritos',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 6,
        name: 'Curry House',
        cuisine: 'Indian',
        rating: 4.4,
        address: '987 Spice Market St, East Village',
        phone: '+1-555-0987',
        latitude: userLat ? userLat + 0.007 : 40.7303,
        longitude: userLng ? userLng - 0.015 : -73.9870,
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
        priceRange: '$$',
        isOpen: true,
        openingHours: '25-35 min',
        description: 'Indian • Curry • Vegetarian',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 7,
        name: 'Le Bistro',
        cuisine: 'French',
        rating: 4.9,
        address: '456 Park Ave, Upper East Side',
        phone: '+1-555-0456',
        latitude: userLat ? userLat - 0.012 : 40.7700,
        longitude: userLng ? userLng + 0.018 : -73.9700,
        imageUrl: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop',
        priceRange: '$$$$',
        isOpen: true,
        openingHours: '45-60 min',
        description: 'French • Fine Dining',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 8,
        name: 'Street Food Co.',
        cuisine: 'Street Food',
        rating: 4.3,
        address: '123 Food Truck Park, Brooklyn',
        phone: '+1-555-0123',
        latitude: userLat ? userLat + 0.020 : 40.6892,
        longitude: userLng ? userLng - 0.025 : -73.9900,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d49a?w=400&h=300&fit=crop',
        priceRange: '$',
        isOpen: true,
        openingHours: '5-15 min',
        description: 'Street Food • Quick Bites',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 9,
        name: 'Brew & Bean Coffee',
        cuisine: 'Coffee',
        rating: 4.7,
        address: '234 Coffee Lane, SoHo',
        phone: '+1-555-0234',
        latitude: userLat ? userLat + 0.003 : 40.7614,
        longitude: userLng ? userLng - 0.007 : -73.9776,
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
        priceRange: '$$',
        isOpen: true,
        openingHours: '10-15 min',
        description: 'Coffee • Pastries • Breakfast',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 10,
        name: 'Central Park Café',
        cuisine: 'Coffee',
        rating: 4.5,
        address: '567 Central Park West',
        phone: '+1-555-0567',
        latitude: userLat ? userLat + 0.012 : 40.7829,
        longitude: userLng ? userLng + 0.015 : -73.9654,
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
        priceRange: '$$',
        isOpen: true,
        openingHours: '5-10 min',
        description: 'Coffee • Sandwiches • Light Meals',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 11,
        name: 'Roma Pizzeria',
        cuisine: 'Italian',
        rating: 4.6,
        address: '890 Little Italy St, Manhattan',
        phone: '+1-555-0890',
        latitude: userLat ? userLat - 0.010 : 40.7589,
        longitude: userLng ? userLng + 0.009 : -73.9851,
        imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&h=300&fit=crop',
        priceRange: '$$',
        isOpen: true,
        openingHours: '20-30 min',
        description: 'Italian • Pizza • Pasta',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 12,
        name: 'Tokyo Ramen House',
        cuisine: 'Japanese',
        rating: 4.8,
        address: '345 East Village St',
        phone: '+1-555-0345',
        latitude: userLat ? userLat + 0.008 : 40.7335,
        longitude: userLng ? userLng - 0.012 : -73.9857,
        imageUrl: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=300&fit=crop',
        priceRange: '$$',
        isOpen: true,
        openingHours: '15-25 min',
        description: 'Japanese • Ramen • Noodles',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 13,
        name: 'Classic American Diner',
        cuisine: 'American',
        rating: 4.4,
        address: '678 Broadway, Midtown',
        phone: '+1-555-0678',
        latitude: userLat ? userLat - 0.006 : 40.7505,
        longitude: userLng ? userLng + 0.011 : -73.9851,
        imageUrl: 'https://images.unsplash.com/photo-1552566393-6a91ad6bb915?w=400&h=300&fit=crop',
        priceRange: '$$',
        isOpen: true,
        openingHours: '15-25 min',
        description: 'American • Burgers • Breakfast',
        active: false,
        created_at: '',
        updated_at: ''
      },
      {
        id: 14,
        name: 'El Mariachi Mexican',
        cuisine: 'Mexican',
        rating: 4.7,
        address: '123 Chelsea Ave',
        phone: '+1-555-0123',
        latitude: userLat ? userLat + 0.009 : 40.7464,
        longitude: userLng ? userLng - 0.008 : -73.9970,
        imageUrl: 'https://images.unsplash.com/photo-1615870216519-2f9fa2ba6d4c?w=400&h=300&fit=crop',
        priceRange: '$$',
        isOpen: true,
        openingHours: '15-25 min',
        description: 'Mexican • Authentic • Tacos',
        active: false,
        created_at: '',
        updated_at: ''
      },
    ];

    return baseRestaurants;
  }

  /**
   * Mock categories for development/testing
   */
  private getMockCategories(): Category[] {
    return [
      {
        id: 1, 
        name: 'Italian',
        active: true,
        created_at: '',
        updated_at: ''
      },
      {
        id: 2, name: 'American',
        active: true,
        created_at: '',
        updated_at: ''
      },
      { 
        id: 3, 
        name: 'Japanese', 
        active: true,
        created_at: '',
        updated_at: ''
      },
      { 
        id: 4, 
        name: 'Mexican', 
        active: true,
        created_at: '',
        updated_at: ''
      },
      { 
        id: 5, 
        name: 'Coffee', 
        active: true,
        created_at: '',
        updated_at: '' 
      }
    ];
  }
}

// Export a default instance
export const apiService = ApiService.getInstance();