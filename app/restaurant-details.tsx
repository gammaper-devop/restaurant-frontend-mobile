import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { apiService } from '../services/apiService';
import { Restaurant } from '../types';

const { width } = Dimensions.get('window');

export default function RestaurantDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadRestaurantDetails();
  }, [id]);

  const loadRestaurantDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await apiService.getRestaurantById(parseInt(id));
      console.log(`✅ Data: ${data} loaded`);
      setRestaurant(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (restaurant?.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    }
  };

  const handleDirections = () => {
    if (restaurant?.latitude && restaurant?.longitude) {
      const url = `https://maps.google.com/?q=${restaurant.latitude},${restaurant.longitude}`;
      Linking.openURL(url);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center">
          <View className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <Text className="text-gray-600 mt-4">Loading restaurant...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
          <Text className="text-xl font-semibold text-gray-900 mt-4">
            Restaurant not found
          </Text>
          <Text className="text-gray-600 text-center mt-2 mb-6">
            The restaurant you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          {/* Restaurant Image */}
          <View className="relative">
            <Image
              source={{ uri: restaurant.imageUrl }}
              style={{ width, height: 280 }}
              resizeMode="cover"
            />
            
            {/* Header Overlay */}
            <View className="absolute top-0 left-0 right-0 flex-row justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 bg-white/90 rounded-full items-center justify-center"
              >
                <Ionicons name="arrow-back" size={20} color="#1F2937" />
              </TouchableOpacity>
              
              <View className="flex-row">
                <TouchableOpacity className="w-10 h-10 bg-white/90 rounded-full items-center justify-center mr-3">
                  <Ionicons name="share-outline" size={20} color="#1F2937" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={toggleFavorite}
                  className="w-10 h-10 bg-white/90 rounded-full items-center justify-center"
                >
                  <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isFavorite ? "#EF4444" : "#1F2937"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Status Badge */}
            <View className="absolute bottom-4 left-4">
              <View className={`px-3 py-1.5 rounded-full flex-row items-center ${
                restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <View className={`w-2 h-2 rounded-full mr-2 ${
                  restaurant.isOpen ? 'bg-white' : 'bg-white'
                }`} />
                <Text className="text-white font-medium text-sm">
                  {restaurant.isOpen ? 'Open Now' : 'Closed'}
                </Text>
              </View>
            </View>
          </View>

          {/* Restaurant Info */}
          <View className="p-6">
            {/* Header */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                  {restaurant.name}
                </Text>
                <Text className="text-gray-600 text-base">
                  {restaurant.description}
                </Text>
              </View>
              
              <View className="flex-row items-center bg-yellow-50 px-3 py-2 rounded-xl">
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text className="text-lg font-bold text-gray-900 ml-2">
                  {restaurant.rating}
                </Text>
              </View>
            </View>

            {/* Quick Info */}
            <View className="flex-row justify-between mb-6 p-4 bg-gray-50 rounded-2xl">
              <View className="items-center flex-1">
                <Ionicons name="bicycle" size={24} color="#059669" />
                <Text className="text-sm font-semibold text-gray-900 mt-2">
                  {restaurant.openingHours}
                </Text>
                <Text className="text-xs text-gray-600">Delivery</Text>
              </View>
              
              <View className="items-center flex-1">
                <Ionicons name="wallet-outline" size={24} color="#3B82F6" />
                <Text className="text-sm font-semibold text-gray-900 mt-2">
                  {restaurant.priceRange}
                </Text>
                <Text className="text-xs text-gray-600">Price Range</Text>
              </View>
              
              <View className="items-center flex-1">
                <Ionicons name="location-outline" size={24} color="#8B5CF6" />
                <Text className="text-sm font-semibold text-gray-900 mt-2">
                  2.5 km
                </Text>
                <Text className="text-xs text-gray-600">Distance</Text>
              </View>
            </View>

            {/* Contact Info */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Contact & Location</Text>
              
              <View className="space-y-3">
                {restaurant.address && (
                  <View className="flex-row items-center p-4 bg-gray-50 rounded-xl">
                    <Ionicons name="location" size={20} color="#6B7280" />
                    <Text className="text-gray-700 ml-3 flex-1">{restaurant.address}</Text>
                    <TouchableOpacity onPress={handleDirections}>
                      <Text className="text-blue-600 font-medium">Directions</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {restaurant.phone && (
                  <View className="flex-row items-center p-4 bg-gray-50 rounded-xl">
                    <Ionicons name="call" size={20} color="#6B7280" />
                    <Text className="text-gray-700 ml-3 flex-1">{restaurant.phone}</Text>
                    <TouchableOpacity onPress={handleCall}>
                      <Text className="text-blue-600 font-medium">Call</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Opening Hours */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Opening Hours</Text>
              <View className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-gray-700">Monday - Friday</Text>
                  <Text className="text-gray-900 font-medium">9:00 AM - 10:00 PM</Text>
                </View>
                <View className="flex-row justify-between items-center py-2 border-t border-gray-200">
                  <Text className="text-gray-700">Saturday - Sunday</Text>
                  <Text className="text-gray-900 font-medium">10:00 AM - 11:00 PM</Text>
                </View>
              </View>
            </View>

            {/* Cuisine Type */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Cuisine</Text>
              <View className="flex-row flex-wrap">
                {restaurant.cuisine?.split(' • ').map((cuisine, index) => (
                  <View key={index} className="bg-emerald-50 px-3 py-2 rounded-full mr-2 mb-2">
                    <Text className="text-emerald-700 font-medium">{cuisine}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Reviews Summary */}
            <View className="mb-8">
              <Text className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</Text>
              <View className="bg-gray-50 rounded-xl p-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Text className="text-3xl font-bold text-gray-900">{restaurant.rating}</Text>
                    <View className="ml-3">
                      <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name="star"
                            size={16}
                            color={star <= Math.floor(restaurant.rating || 0) ? "#F59E0B" : "#E5E7EB"}
                          />
                        ))}
                      </View>
                      <Text className="text-sm text-gray-600 mt-1">Based on 150+ reviews</Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text className="text-blue-600 font-medium">See all reviews</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View className="border-t border-gray-200 p-4 bg-white">
          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={handleCall}
              className="flex-1 bg-gray-100 py-4 rounded-xl items-center"
            >
              <Ionicons name="call" size={20} color="#374151" />
              <Text className="text-gray-700 font-medium mt-1">Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleDirections}
              className="flex-1 bg-gray-100 py-4 rounded-xl items-center"
            >
              <Ionicons name="navigate-outline" size={20} color="#374151" />
              <Text className="text-gray-700 font-medium mt-1">Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}