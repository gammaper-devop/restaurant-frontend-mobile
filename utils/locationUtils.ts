import { UserLocation } from '../types';

/**
 * Calculate the distance between two geographic points using the Haversine formula
 * @param point1 First coordinate point
 * @param point2 Second coordinate point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) * Math.cos(toRadians(point2.latitude)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 * @param distanceInKm Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distanceInKm: number): string => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  } else if (distanceInKm < 10) {
    return `${distanceInKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceInKm)}km`;
  }
};

/**
 * Sort restaurants by distance from user location
 * @param restaurants Array of restaurants with location data
 * @param userLocation User's current location
 * @returns Sorted array with distance information added
 */
export const sortRestaurantsByDistance = <T extends { latitude: number; longitude: number }>(
  restaurants: T[],
  userLocation: UserLocation
): (T & { distance: number; formattedDistance: string })[] => {
  return restaurants
    .map(restaurant => {
      const distance = calculateDistance(userLocation, restaurant);
      return {
        ...restaurant,
        distance,
        formattedDistance: formatDistance(distance),
      };
    })
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Filter restaurants within a specific radius
 * @param restaurants Array of restaurants with location data
 * @param userLocation User's current location
 * @param radiusKm Maximum distance in kilometers
 * @returns Filtered array of nearby restaurants
 */
export const filterRestaurantsWithinRadius = <T extends { latitude: number; longitude: number }>(
  restaurants: T[],
  userLocation: UserLocation,
  radiusKm: number
): T[] => {
  return restaurants.filter(restaurant => {
    const distance = calculateDistance(userLocation, restaurant);
    return distance <= radiusKm;
  });
};

/**
 * Get the nearest restaurant from an array
 * @param restaurants Array of restaurants with location data
 * @param userLocation User's current location
 * @returns The nearest restaurant with distance info, or null if array is empty
 */
export const getNearestRestaurant = <T extends { latitude: number; longitude: number }>(
  restaurants: T[],
  userLocation: UserLocation
): (T & { distance: number; formattedDistance: string }) | null => {
  if (restaurants.length === 0) return null;
  
  const sorted = sortRestaurantsByDistance(restaurants, userLocation);
  return sorted[0];
};

/**
 * Check if location permission is granted
 * @param permissionResponse Permission response from expo-location
 * @returns Boolean indicating if permission is granted
 */
export const isLocationPermissionGranted = (
  permissionResponse: any
): boolean => {
  return permissionResponse?.status === 'granted';
};

/**
 * Get a friendly error message for location errors
 * @param error Error object or string
 * @returns User-friendly error message
 */
export const getLocationErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error?.code) {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        return 'Location permission denied. Please enable location access in settings.';
      case 'POSITION_UNAVAILABLE':
        return 'Location unavailable. Please check your GPS settings.';
      case 'TIMEOUT':
        return 'Location request timed out. Please try again.';
      default:
        return 'Unable to get your location. Please try again.';
    }
  }
  
  return error?.message || 'An unknown location error occurred.';
};