import { useState, useEffect } from 'react';
import { Restaurant } from '../types';
import { useLocation } from './useLocation';
import { sortRestaurantsByDistance, filterRestaurantsWithinRadius } from '../utils/locationUtils';
import { apiService } from '../services/apiService';

interface NearbyRestaurantsState {
  restaurants: (Restaurant & { distance: number; formattedDistance: string })[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

interface UseNearbyRestaurantsOptions {
  radiusKm?: number;
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

export const useNearbyRestaurants = (options: UseNearbyRestaurantsOptions = {}) => {
  const {
    radiusKm = 10, // Default 10km radius
    autoRefresh = true,
    refreshIntervalMs = 30000, // Refresh every 30 seconds
  } = options;

  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useLocation();
  
  const [state, setState] = useState<NearbyRestaurantsState>({
    restaurants: [],
    loading: false,
    error: null,
    refreshing: false,
  });

  // Fetch nearby restaurants
  const fetchNearbyRestaurants = async (userLocation = location, isRefreshing = false) => {
    if (!userLocation) {
      setState(prev => ({ 
        ...prev, 
        error: 'Location not available',
        loading: false,
        refreshing: false,
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
      // Get restaurants from API
      const allRestaurants = await apiService.getNearbyRestaurants(
        userLocation.latitude,
        userLocation.longitude,
        radiusKm
      );

      // Filter and sort by distance
      const filteredRestaurants = filterRestaurantsWithinRadius(
        allRestaurants,
        userLocation,
        radiusKm
      );

      const sortedRestaurants = sortRestaurantsByDistance(
        filteredRestaurants,
        userLocation
      );

      setState(prev => ({
        ...prev,
        restaurants: sortedRestaurants,
        loading: false,
        refreshing: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch nearby restaurants';
      setState(prev => ({
        ...prev,
        restaurants: [],
        loading: false,
        refreshing: false,
        error: errorMessage,
      }));
    }
  };

  // Manual refresh function
  const refresh = async () => {
    let currentLocation = location;
    
    // Get fresh location if needed
    if (!currentLocation) {
      try {
        currentLocation = await getCurrentLocation();
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to get location for refresh',
          refreshing: false,
        }));
        return;
      }
    }

    await fetchNearbyRestaurants(currentLocation, true);
  };

  // Initial fetch when location becomes available
  useEffect(() => {
    if (location && !locationLoading) {
      fetchNearbyRestaurants(location);
    }
  }, [location, locationLoading, radiusKm]);

  // Handle location errors
  useEffect(() => {
    if (locationError) {
      setState(prev => ({
        ...prev,
        error: locationError,
        loading: false,
        refreshing: false,
      }));
    }
  }, [locationError]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !location) return;

    const interval = setInterval(() => {
      if (!state.loading && !state.refreshing) {
        fetchNearbyRestaurants(location, true);
      }
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshIntervalMs, location, state.loading, state.refreshing]);

  return {
    ...state,
    refresh,
    userLocation: location,
    locationLoading,
    hasLocation: !!location,
  };
};