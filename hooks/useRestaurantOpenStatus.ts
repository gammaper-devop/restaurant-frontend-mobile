import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { Restaurant } from '../types';

// TypeScript declaration for __DEV__
declare const __DEV__: boolean;

interface RestaurantOpenStatus {
  [restaurantId: number]: {
    isOpen: boolean | null;
    loading: boolean;
    lastChecked?: Date;
  };
}

interface UseRestaurantOpenStatusProps {
  restaurants: Restaurant[];
  refreshInterval?: number; // in milliseconds, default 5 minutes
}

export const useRestaurantOpenStatus = ({ 
  restaurants, 
  refreshInterval = 5 * 60 * 1000 // 5 minutes default
}: UseRestaurantOpenStatusProps) => {
  const [openStatuses, setOpenStatuses] = useState<RestaurantOpenStatus>({});

  const checkRestaurantOpenStatus = useCallback(async (restaurant: Restaurant) => {
    if (!restaurant.id) return;

    // Set loading state
    setOpenStatuses(prev => ({
      ...prev,
      [restaurant.id]: {
        ...prev[restaurant.id],
        loading: true
      }
    }));

    try {
      // First, get restaurant locations
      const locations = await apiService.getRestaurantLocationsByRestaurantId(restaurant.id);
      
      if (locations.length > 0) {
        // Use the first location to check open status
        const isOpen = await apiService.isLocationCurrentlyOpen(locations[0].id);
        
        setOpenStatuses(prev => ({
          ...prev,
          [restaurant.id]: {
            isOpen,
            loading: false,
            lastChecked: new Date()
          }
        }));
      } else {
        // No locations found, fall back to static value
        setOpenStatuses(prev => ({
          ...prev,
          [restaurant.id]: {
            isOpen: restaurant.isOpen || false,
            loading: false,
            lastChecked: new Date()
          }
        }));
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to check restaurant open status:', error);
      }
      
      // Fall back to static value on error
      setOpenStatuses(prev => ({
        ...prev,
        [restaurant.id]: {
          isOpen: restaurant.isOpen || false,
          loading: false,
          lastChecked: new Date()
        }
      }));
    }
  }, []);

  const checkAllRestaurants = useCallback(async () => {
    if (restaurants.length === 0) return;

    // Process restaurants in batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < restaurants.length; i += batchSize) {
      const batch = restaurants.slice(i, i + batchSize);
      await Promise.all(
        batch.map(restaurant => checkRestaurantOpenStatus(restaurant))
      );
      
      // Small delay between batches to be kind to the API
      if (i + batchSize < restaurants.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, [restaurants, checkRestaurantOpenStatus]);

  const refreshOpenStatuses = useCallback(() => {
    checkAllRestaurants();
  }, [checkAllRestaurants]);

  // Check all restaurants when the list changes
  useEffect(() => {
    if (restaurants.length > 0) {
      checkAllRestaurants();
    }
  }, [restaurants, checkAllRestaurants]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        checkAllRestaurants();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, checkAllRestaurants]);

  const getRestaurantOpenStatus = useCallback((restaurantId: number) => {
    return openStatuses[restaurantId] || {
      isOpen: null,
      loading: false
    };
  }, [openStatuses]);

  return {
    openStatuses,
    getRestaurantOpenStatus,
    refreshOpenStatuses,
    isLoading: Object.values(openStatuses).some(status => status.loading)
  };
};