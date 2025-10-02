import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { Restaurant, UserLocation } from '../types';
import { sortRestaurantsByDistance } from '../utils/locationUtils';

interface RestaurantsByCategoryState {
  restaurants: (Restaurant & { distance: number; formattedDistance: string; isOpen: boolean })[];
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

  /**
   * Check if a restaurant is currently open by verifying its locations
   * @param restaurant Restaurant to check
   * @returns Boolean indicating if the restaurant is open
   */
  const checkRestaurantOpenStatus = async (restaurant: Restaurant): Promise<boolean> => {
    try {
      // If restaurant already has isOpen property and it's defined, use it
      if (restaurant.isOpen !== undefined) {
        return restaurant.isOpen;
      }

      // Get restaurant locations
      const locations = await apiService.getRestaurantLocationsByRestaurantId(restaurant.id);
      
      if (locations.length === 0) {
        // If no locations found, assume closed
        return false;
      }

      // Check if at least one location is open
      // For restaurants with multiple locations, we consider it open if ANY location is open
      const openStatusPromises = locations.map(location => 
        apiService.isLocationCurrentlyOpen(location.id)
      );
      
      const openStatuses = await Promise.all(openStatusPromises);
      
      // Return true if any location is open
      return openStatuses.some(isOpen => isOpen);
    } catch (error) {
      console.warn(`Failed to check open status for restaurant ${restaurant.id}:`, error);
      // In case of error, return false (closed) as a safe default
      return false;
    }
  };

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

      // Sort restaurants by distance and relevance
      let sortedRestaurants;
      
      if (userLocation) {
        // User location available - sort by actual distance (closest first)
        sortedRestaurants = sortRestaurantsByDistance(restaurants, userLocation);
      } else {
        // No user location - provide intelligent fallback sorting logic
        sortedRestaurants = restaurants
          .map(restaurant => ({
            ...restaurant,
            distance: -1, // Use -1 to indicate unknown distance (helpful for debugging)
            formattedDistance: 'Unknown', // More user-friendly than 'N/A'
          }))
          // Without location data, sort by rating and name for best user experience
          .sort((a, b) => {
            // Primary sort: Prioritize restaurants with higher ratings
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            if (ratingA !== ratingB) {
              return ratingB - ratingA; // Higher rating first (4.5 before 4.0)
            }
            // Secondary sort: If ratings are equal, sort alphabetically by name
            return (a.name || '').localeCompare(b.name || '');
          });
      }

      // Check open status for each restaurant
      const restaurantsWithOpenStatus = await Promise.all(
        sortedRestaurants.map(async (restaurant) => {
          const isOpen = await checkRestaurantOpenStatus(restaurant);
          return {
            ...restaurant,
            isOpen
          };
        })
      );

      // Final sort: prioritize open restaurants while maintaining distance/rating order
      const finalSortedRestaurants = restaurantsWithOpenStatus.sort((a, b) => {
        // First priority: open restaurants come before closed ones
        if (a.isOpen !== b.isOpen) {
          return b.isOpen ? 1 : -1; // Open restaurants first
        }
        
        // Second priority: maintain existing order (distance or rating-based)
        // Since we already sorted above, we preserve the relative order for restaurants with same open status
        const indexA = sortedRestaurants.findIndex(r => r.id === a.id);
        const indexB = sortedRestaurants.findIndex(r => r.id === b.id);
        return indexA - indexB;
      });

      setState(prev => ({
        ...prev,
        restaurants: finalSortedRestaurants,
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