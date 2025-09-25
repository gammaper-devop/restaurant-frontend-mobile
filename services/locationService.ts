import * as Location from 'expo-location';
import { UserLocation } from '../types';
import { getLocationErrorMessage } from '../utils/locationUtils';

export class LocationService {
  private static instance: LocationService;
  private watchSubscription: Location.LocationSubscription | null = null;
  private currentLocation: UserLocation | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<{ granted: boolean; permission: Location.LocationPermissionResponse }> {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      return {
        granted: permission.status === 'granted',
        permission,
      };
    } catch (error) {
      throw new Error(getLocationErrorMessage(error));
    }
  }

  /**
   * Check current permission status
   */
  async checkPermissions(): Promise<{ granted: boolean; permission: Location.LocationPermissionResponse }> {
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      return {
        granted: permission.status === 'granted',
        permission,
      };
    } catch (error) {
      throw new Error(getLocationErrorMessage(error));
    }
  }

  /**
   * Get current position with optional configuration
   */
  async getCurrentPosition(options?: {
    accuracy?: Location.Accuracy;
    maximumAge?: number;
  }): Promise<UserLocation> {
    try {
      // Check permissions first
      const { granted } = await this.checkPermissions();
      if (!granted) {
        const { granted: newPermission } = await this.requestPermissions();
        if (!newPermission) {
          throw new Error('Location permission denied');
        }
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: options?.accuracy || Location.Accuracy.Balanced,
        //maximumAge: options?.maximumAge || 10000,
      });

      const userLocation: UserLocation = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy || undefined,
      };

      this.currentLocation = userLocation;
      return userLocation;
    } catch (error) {
      throw new Error(getLocationErrorMessage(error));
    }
  }

  /**
   * Get last known location (cached)
   */
  getLastKnownLocation(): UserLocation | null {
    return this.currentLocation;
  }

  /**
   * Start watching position changes
   */
  async startWatching(
    callback: (location: UserLocation) => void,
    options?: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    }
  ): Promise<() => void> {
    try {
      // Check permissions first
      const { granted } = await this.checkPermissions();
      if (!granted) {
        const { granted: newPermission } = await this.requestPermissions();
        if (!newPermission) {
          throw new Error('Location permission denied');
        }
      }

      // Stop any existing watch
      this.stopWatching();

      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: options?.accuracy || Location.Accuracy.Balanced,
          timeInterval: options?.timeInterval || 10000, // 10 seconds
          distanceInterval: options?.distanceInterval || 100, // 100 meters
        },
        (locationResult) => {
          const userLocation: UserLocation = {
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude,
            accuracy: locationResult.coords.accuracy || undefined,
          };
          
          this.currentLocation = userLocation;
          callback(userLocation);
        }
      );

      // Return cleanup function
      return () => this.stopWatching();
    } catch (error) {
      throw new Error(getLocationErrorMessage(error));
    }
  }

  /**
   * Stop watching position changes
   */
  stopWatching(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  async reverseGeocode(location: UserLocation): Promise<Location.LocationGeocodedAddress[]> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      return addresses;
    } catch (error) {
      throw new Error(getLocationErrorMessage(error));
    }
  }

  /**
   * Get coordinates from address (geocoding)
   */
  async geocode(address: string): Promise<Location.LocationGeocodedLocation[]> {
    try {
      const locations = await Location.geocodeAsync(address);
      return locations;
    } catch (error) {
      throw new Error(getLocationErrorMessage(error));
    }
  }

  /**
   * Check if location services are enabled
   */
  async isLocationServicesEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      return false;
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopWatching();
    this.currentLocation = null;
  }
}

// Export a default instance
export const locationService = LocationService.getInstance();