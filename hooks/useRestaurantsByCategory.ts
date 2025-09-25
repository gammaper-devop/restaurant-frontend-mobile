import { useState, useEffect, useCallback } from 'react';
import { Restaurant } from '../types';
import { apiService } from '../services/apiService';
import { sortRestaurantsByDistance } from '../utils/locationUtils';
import { UserLocation } from '../types';

interface RestaurantsByCategoryState {
  restaurants: (Restaurant & { distance: number; formattedDistance: string })[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

interface UseRestaurantsByCategoryOptions {
  userLocation?: UserLocation | null;
  radiusKm?: number;
}

export const useRestaurantsByCategory = (
  categoryId: number | null,
  options: UseRestaurantsByCategoryOptions = {}
) => {
  const { userLocation, radiusKm = 15 } = options;
  
  const [state, setState] = useState<RestaurantsByCategoryState>({
    restaurants: [],
    loading: false,
    error: null,
    refreshing: false,
  });

  const fetchRestaurantsByCategory = useCallback(async (isRefreshing = false) => {
    if (!categoryId) {
      setState(prev => ({
        ...prev,
        restaurants: [],
        loading: false,
        refreshing: false,
        error: null,
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      loading: !isRefreshing, 
      refreshing: isRefreshing,
      error: null 
    }));

    try {
      const restaurants = await apiService.getRestaurantsByCategory(
        categoryId,
        userLocation?.latitude,
        userLocation?.longitude
      );

      // Sort by distance if user location is available
      const sortedRestaurants = userLocation 
        ? sortRestaurantsByDistance(restaurants, userLocation)
        : restaurants.map(restaurant => ({
            ...restaurant,
            distance: 0,
            formattedDistance: 'N/A',
          }));

      setState(prev => ({
        ...prev,
        restaurants: sortedRestaurants,
        loading: false,
        refreshing: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch restaurants by category';
      setState(prev => ({
        ...prev,
        restaurants: [],
        loading: false,
        refreshing: false,
        error: errorMessage,
      }));
    }
  }, [categoryId, userLocation?.latitude, userLocation?.longitude, radiusKm]);

  const refresh = useCallback(() => {
    fetchRestaurantsByCategory(true);
  }, [fetchRestaurantsByCategory]);

  useEffect(() => {
    fetchRestaurantsByCategory();
  }, [fetchRestaurantsByCategory]);

  return {
    ...state,
    refresh,
  };
};