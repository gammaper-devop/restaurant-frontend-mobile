import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { useNearbyRestaurants } from '../hooks/useNearbyRestaurants';
import { locationService } from '../services/locationService';

const LocationExample: React.FC = () => {
  const { 
    location, 
    loading: locationLoading, 
    error: locationError, 
    getCurrentLocation,
    permission
  } = useLocation();

  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
    refresh,
    refreshing,
    hasLocation
  } = useNearbyRestaurants({
    radiusKm: 5, // 5km radius
    autoRefresh: true,
    refreshIntervalMs: 60000, // Refresh every minute
  });

  const handleGetLocation = async () => {
    try {
      await getCurrentLocation();
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleRefreshRestaurants = () => {
    refresh();
  };

  const handleLocationServiceExample = async () => {
    try {
      // Example of using the LocationService directly
      const isEnabled = await locationService.isLocationServicesEnabled();
      if (!isEnabled) {
        Alert.alert('Location Services', 'Please enable location services');
        return;
      }

      const currentPos = await locationService.getCurrentPosition();
      Alert.alert('Current Position', `Lat: ${currentPos.latitude.toFixed(4)}, Lng: ${currentPos.longitude.toFixed(4)}`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const renderRestaurantItem = ({ item }: { item: any }) => (
    <View className="bg-white p-4 mb-2 rounded-lg shadow-sm border border-gray-200">
      <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
      <Text className="text-sm text-gray-600 mt-1">{item.cuisine || 'Restaurant'}</Text>
      <Text className="text-sm text-blue-600 mt-2">📍 {item.formattedDistance}</Text>
      {item.address && (
        <Text className="text-xs text-gray-500 mt-1">{item.address}</Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Location Status Section */}
      <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Location Status</Text>
        
        {locationLoading && (
          <View className="flex-row items-center mb-2">
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text className="text-blue-600 ml-2">Getting location...</Text>
          </View>
        )}

        {location && (
          <View className="mb-2">
            <Text className="text-sm text-gray-600">
              📍 Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
            </Text>
            {location.accuracy && (
              <Text className="text-xs text-gray-500">
                Accuracy: ±{Math.round(location.accuracy)}m
              </Text>
            )}
          </View>
        )}

        {locationError && (
          <Text className="text-red-600 text-sm mb-2">{locationError}</Text>
        )}

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleGetLocation}
            disabled={locationLoading}
            className={`px-4 py-2 rounded-lg ${locationLoading ? 'bg-gray-300' : 'bg-blue-600'}`}
          >
            <Text className={`text-center font-medium ${locationLoading ? 'text-gray-500' : 'text-white'}`}>
              Get Location
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLocationServiceExample}
            className="px-4 py-2 rounded-lg bg-green-600"
          >
            <Text className="text-center font-medium text-white">Service Test</Text>
          </TouchableOpacity>
        </View>

        {permission && (
          <Text className="text-xs text-gray-500 mt-2">
            Permission: {permission.status}
          </Text>
        )}
      </View>

      {/* Nearby Restaurants Section */}
      <View className="bg-white p-4 rounded-lg shadow-sm flex-1">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900">Nearby Restaurants</Text>
          <TouchableOpacity
            onPress={handleRefreshRestaurants}
            disabled={refreshing || !hasLocation}
            className={`px-3 py-1 rounded ${refreshing || !hasLocation ? 'bg-gray-200' : 'bg-blue-100'}`}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <Text className={`text-sm font-medium ${!hasLocation ? 'text-gray-400' : 'text-blue-600'}`}>
                Refresh
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {restaurantsLoading && !refreshing && (
          <View className="flex-row items-center justify-center py-8">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-blue-600 ml-2">Loading restaurants...</Text>
          </View>
        )}

        {restaurantsError && (
          <View className="py-8">
            <Text className="text-red-600 text-center">{restaurantsError}</Text>
          </View>
        )}

        {!hasLocation && !locationLoading && !restaurantsLoading && (
          <View className="py-8">
            <Text className="text-gray-500 text-center">
              Location needed to show nearby restaurants
            </Text>
          </View>
        )}

        {restaurants.length === 0 && hasLocation && !restaurantsLoading && !restaurantsError && (
          <View className="py-8">
            <Text className="text-gray-500 text-center">
              No restaurants found within 5km
            </Text>
          </View>
        )}

        {restaurants.length > 0 && (
          <FlatList
            data={restaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefreshRestaurants}
          />
        )}
      </View>
    </View>
  );
};

export default LocationExample;