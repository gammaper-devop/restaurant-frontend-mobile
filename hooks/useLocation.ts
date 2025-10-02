import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { UserLocation } from '../types';

interface LocationState {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  permission: Location.LocationPermissionResponse | null;
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    permission: null,
  });

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const permission = await Location.getForegroundPermissionsAsync();
      
      setState(prev => ({ ...prev, permission }));
      
      if (status !== 'granted') {
        setState(prev => ({ 
          ...prev, 
          error: 'Permission to access location was denied. Please enable location access in your device settings.' 
        }));
        return false;
      }
      
      setState(prev => ({ ...prev, error: null }));
      return true;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to request location permission' 
      }));
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<UserLocation | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check if we have permission
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setState(prev => ({ ...prev, loading: false }));
        return null;
      }

      // Get current location
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        // Note: maxAge is not available in expo-location, removing for compatibility
      });

      const userLocation: UserLocation = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy || undefined,
      };

      setState(prev => ({ 
        ...prev, 
        location: userLocation, 
        loading: false, 
        error: null 
      }));

      return userLocation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get current location';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return null;
    }
  };

  const watchLocation = (callback: (location: UserLocation) => void) => {
    let watchSubscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 100, // Update when moved 100 meters
        },
        (locationResult) => {
          const userLocation: UserLocation = {
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude,
            accuracy: locationResult.coords.accuracy || undefined,
          };
          
          setState(prev => ({ ...prev, location: userLocation }));
          callback(userLocation);
        }
      );
    };

    startWatching();

    // Return cleanup function
    return () => {
      if (watchSubscription) {
        watchSubscription.remove();
      }
    };
  };

  // Auto-request permission on mount
  useEffect(() => {
    requestPermission();
  }, []);

  return {
    ...state,
    getCurrentLocation,
    watchLocation,
    requestPermission,
  };
};