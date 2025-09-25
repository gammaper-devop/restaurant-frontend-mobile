// Base Entity
export interface BaseEntity {
  id: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Location related types
export interface Country extends BaseEntity {
  name: string;
}

export interface City extends BaseEntity {
  name: string;
  country: Country;
}

export interface Province extends BaseEntity {
  name: string;
  city: City;
}

export interface District extends BaseEntity {
  name: string;
  province: Province;
}

// Operating Hours
export interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

export interface OperatingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

// Category
export interface Category extends BaseEntity {
  name: string;
}

// Restaurant
export interface Restaurant extends BaseEntity {
  name: string;
  logo?: string;
  category?: Category;
  locations?: RestaurantLocation[];
  cuisine?: string;
  rating?: number;
  address?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  isOpen?: boolean;
  openingHours?: string;
  description?: string;
}

// Restaurant Location
export interface RestaurantLocation extends BaseEntity {
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  operatingHours: OperatingHours;
  restaurant: Restaurant;
  district: District;
  isCurrentlyOpen?: boolean;
}

// Nearby Restaurant Result (for mobile app)
export interface NearbyRestaurantResult {
  id: number;
  name: string;
  logo?: string;
  category: Category;
  location: RestaurantLocation;
  distance: number; // in kilometers
  rating?: number;
  isCurrentlyOpen: boolean;
  estimatedDeliveryTime?: string;
}

// Search and Filter types
export interface RestaurantFilters {
  category?: number;
  isOpen?: boolean;
  maxDistance?: number;
  minRating?: number;
}

export interface SortOptions {
  sortBy: 'distance' | 'rating' | 'name';
  sortOrder: 'asc' | 'desc';
}

// Location types for mobile
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ message: string }>;
}

// Search Request
export interface NearbyRestaurantQuery {
  lat: number;
  lng: number;
  radius?: number; // in kilometers, default 10
}