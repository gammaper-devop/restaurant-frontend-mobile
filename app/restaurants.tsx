import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useNearbyRestaurants } from '../hooks';
import { Ionicons } from '@expo/vector-icons';
import { getImageWithFallback } from '../utils/imageUtils';

export default function RestaurantsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Sort By');

  const {
    restaurants,
    loading,
    error,
    refresh,
    refreshing,
    hasLocation,
    userLocation
  } = useNearbyRestaurants({
    radiusKm: 15,
    autoRefresh: true,
    refreshIntervalMs: 60000,
  });

  const filters = ['Sort By', 'Distance', 'Rating', 'Price', 'Delivery Time'];
  const quickFilters = ['Offers', 'Top Rated', 'Fast Delivery'];

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRestaurantPress = (restaurant: any) => {
    router.push(`/restaurant-details?id=${restaurant.id}`);
  };

  const handleLocationRequest = async () => {
    Alert.alert(
      'Ubicación requerida',
      'Para mostrar restaurantes cercanos, necesitamos acceso a tu ubicación.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Configurar', onPress: () => router.push('/test-geolocation-simple') }
      ]
    );
  };

  const renderRestaurantCard = (restaurant: any, index: number) => {
    // Debug log
    if (__DEV__) {
      console.log('🍽️ Rendering restaurant card:', restaurant.name, 'ID:', restaurant.id);
    }
    
    return (
      <View 
        key={restaurant.id || index}
        className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden"
      >
      {/* Restaurant Image */}
      <View className="relative">
        <Image
          source={{ uri: getImageWithFallback('restaurants', restaurant.imageUrl) }}
          className="w-full h-48"
          resizeMode="cover"
        />
        {/* Favorite Button */}
        <TouchableOpacity className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full items-center justify-center">
          <Ionicons name="heart-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
        
        {/* Delivery Time Badge */}
        <View className="absolute bottom-3 left-3 bg-white/95 rounded-full px-3 py-1.5 flex-row items-center">
          <Ionicons name="bicycle" size={14} color="#059669" />
          <Text className="text-sm font-medium text-gray-800 ml-1">
            {restaurant.openingHours}
          </Text>
        </View>
      </View>

      {/* Restaurant Info */}
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-bold text-gray-900 flex-1 mr-2">
            {restaurant.name}
          </Text>
          <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text className="text-sm font-semibold text-gray-800 ml-1">
              {restaurant.rating}
            </Text>
          </View>
        </View>

        <Text className="text-gray-600 text-sm mb-2">
          {restaurant.description}
        </Text>

        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-blue-600 font-medium ml-1">
              {restaurant.formattedDistance}
            </Text>
            <Text className="text-gray-500 mx-2">•</Text>
            <Text className="text-sm text-gray-500">
              {restaurant.priceRange} delivery
            </Text>
          </View>
          
          {!restaurant.isOpen && (
            <View className="bg-red-50 px-2 py-1 rounded-full">
              <Text className="text-red-600 text-xs font-medium">Closed</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{
          flexDirection: 'row',
          gap: 8,
          marginTop: 8
        }}>
          <TouchableOpacity 
            onPress={() => handleRestaurantPress(restaurant)}
            style={{
              flex: 1,
              backgroundColor: '#f3f4f6',
              paddingVertical: 10,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="information-circle-outline" size={16} color="#374151" />
            <Text style={{
              color: '#374151',
              fontWeight: '500',
              fontSize: 14,
              marginLeft: 4
            }}>Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              if (__DEV__) {
                console.log('🍴 View Menu pressed for:', restaurant.name);
              }
              router.push({
                pathname: '/restaurant-dishes',
                params: { 
                  restaurantId: restaurant.id.toString(),
                  restaurantName: restaurant.name 
                }
              });
            }}
            style={{
              flex: 1,
              backgroundColor: '#EF4444',
              paddingVertical: 10,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="restaurant" size={16} color="white" />
            <Text style={{
              color: 'white',
              fontWeight: '500',
              fontSize: 14,
              marginLeft: 4
            }}>View Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      {!hasLocation ? (
        <View className="items-center px-6">
          <Ionicons name="location-outline" size={64} color="#D1D5DB" />
          <Text className="text-xl font-semibold text-gray-900 mt-4 text-center">
            Enable Location
          </Text>
          <Text className="text-gray-600 text-center mt-2 mb-6 leading-6">
            We need your location to show nearby restaurants and provide accurate delivery estimates.
          </Text>
          <TouchableOpacity
            onPress={handleLocationRequest}
            className="bg-emerald-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Enable Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="items-center px-6">
          <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
          <Text className="text-xl font-semibold text-gray-900 mt-4">
            No restaurants found
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Try adjusting your search or check back later.
          </Text>
        </View>
      )}
    </View>
  );

  const renderError = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text className="text-xl font-semibold text-gray-900 mt-4">
        Something went wrong
      </Text>
      <Text className="text-gray-600 text-center mt-2 mb-6 px-6">
        {error}
      </Text>
      <TouchableOpacity
        onPress={refresh}
        className="bg-blue-600 px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-4 py-3 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">
              Restaurants
            </Text>
            <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <Image
                source={{ uri: 'https://i.pravatar.cc/40' }}
                className="w-8 h-8 rounded-full"
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search restaurants"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-gray-900 text-base"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity className="ml-2">
              <Ionicons name="options" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Filter Buttons */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            className="flex-row"
          >
            {/* Sort By Dropdown */}
            <TouchableOpacity className="bg-emerald-600 rounded-full px-4 py-2.5 mr-3 flex-row items-center">
              <Text className="text-white font-medium mr-2">{selectedFilter}</Text>
              <Ionicons name="chevron-down" size={16} color="white" />
            </TouchableOpacity>

            {/* Quick Filters */}
            {quickFilters.map((filter, index) => (
              <TouchableOpacity
                key={index}
                className="border border-gray-200 rounded-full px-4 py-2.5 mr-3"
              >
                <Text className="text-gray-700 font-medium">{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 py-4">
            {loading && filteredRestaurants.length === 0 ? (
              <View className="items-center py-20">
                <View className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <Text className="text-gray-600 mt-4">Loading restaurants...</Text>
              </View>
            ) : error ? (
              renderError()
            ) : filteredRestaurants.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                {/* Results Header */}
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                  {filteredRestaurants.length} restaurants found
                  {userLocation && (
                    <Text className="text-sm font-normal text-gray-600">
                      {' '}near you
                    </Text>
                  )}
                </Text>

                {/* Restaurant Cards */}
                {filteredRestaurants.map(renderRestaurantCard)}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}