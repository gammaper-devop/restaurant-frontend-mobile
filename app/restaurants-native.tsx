import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useCategories, useNearbyRestaurants } from '../hooks';

const { width } = Dimensions.get('window');

export default function RestaurantsNativeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

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

  // Obtener categorías de la base de datos
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError
  } = useCategories();

  const filteredRestaurants = restaurants.filter(restaurant => {
    // Filtro por texto de búsqueda
    const matchesSearch = !searchQuery || (
      restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return matchesSearch;
  });

  const handleRestaurantPress = (restaurant: any) => {
    router.push(`/restaurant-details-native?id=${restaurant.id}`);
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

  const handleCategoryPress = (category: any) => {
    // Navegar a la pantalla de categoría específica usando el categoryId
    router.push(`/category-restaurants?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}&categoryIcon=${encodeURIComponent(category.icon || '🍽️')}`);
  };

  const renderRestaurantCard = (restaurant: any, index: number) => (
    <TouchableOpacity 
      key={restaurant.id || index}
      style={styles.restaurantCard}
      onPress={() => handleRestaurantPress(restaurant)}
      activeOpacity={0.7}
    >
      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: restaurant.imageUrl }}
          style={styles.restaurantImage}
          resizeMode="cover"
        />
        
        {/* Favorite Button */}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
        
        {/* Delivery Time Badge */}
        <View style={styles.deliveryBadge}>
          <Ionicons name="bicycle" size={14} color="#059669" />
          <Text style={styles.deliveryTime}>
            {restaurant.openingHours}
          </Text>
        </View>
      </View>

      {/* Restaurant Info */}
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {restaurant.rating}
            </Text>
          </View>
        </View>

        <Text style={styles.restaurantDescription} numberOfLines={1}>
          {restaurant.description}
        </Text>

        <View style={styles.restaurantFooter}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.distanceText}>
              {restaurant.formattedDistance}
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.priceText}>
              {restaurant.priceRange} delivery
            </Text>
          </View>
          
          {!restaurant.isOpen && (
            <View style={styles.closedBadge}>
              <Text style={styles.closedText}>Closed</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {!hasLocation ? (
        <View style={styles.emptyContent}>
          <Ionicons name="location-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            Enable Location
          </Text>
          <Text style={styles.emptyDescription}>
            We need your location to show nearby restaurants and provide accurate delivery estimates.
          </Text>
          <TouchableOpacity
            onPress={handleLocationRequest}
            style={styles.enableLocationButton}
          >
            <Text style={styles.enableLocationText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyContent}>
          <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            No restaurants found
          </Text>
          <Text style={styles.emptyDescription}>
            Try adjusting your search or check back later.
          </Text>
        </View>
      )}
    </View>
  );

  const renderError = () => (
    <View style={styles.emptyState}>
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text style={styles.emptyTitle}>
        Something went wrong
      </Text>
      <Text style={styles.emptyDescription}>
        {error}
      </Text>
      <TouchableOpacity
        onPress={refresh}
        style={styles.tryAgainButton}
      >
        <Text style={styles.tryAgainText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Restaurants
            </Text>
            <TouchableOpacity style={styles.profileButton}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/40' }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search restaurants"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity>
              <Ionicons name="options" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Filter Buttons */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filtersContainer}
          >
            {categoriesLoading ? (
              <View style={styles.categoriesLoadingContainer}>
                <ActivityIndicator size="small" color="#059669" />
                <Text style={styles.categoriesLoadingText}>Loading categories...</Text>
              </View>
            ) : categoriesError ? (
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterButtonText}>⚠️ Error loading</Text>
              </TouchableOpacity>
            ) : (
              categories.map((category, index) => (
                <TouchableOpacity
                  key={category.id || index}
                  style={styles.filterButton}
                  onPress={() => handleCategoryPress(category)}
                >
                  <Text style={styles.filterButtonText}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentPadding}>
            {loading && filteredRestaurants.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={styles.loadingText}>Loading restaurants...</Text>
              </View>
            ) : error ? (
              renderError()
            ) : filteredRestaurants.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                {/* Results Header */}
                <View style={styles.resultsHeaderContainer}>
                  <Text style={styles.resultsHeader}>
                    {filteredRestaurants.length} restaurants found
                    {userLocation && (
                      <Text style={styles.resultsSubheader}>
                        {' '}near you
                      </Text>
                    )}
                  </Text>
                </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  sortButton: {
    backgroundColor: '#059669',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    color: 'white',
    fontWeight: '500',
    marginRight: 8,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  filterButtonSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  filterButtonTextSelected: {
    color: 'white',
  },
  categoriesLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  categoriesLoadingText: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 24,
  },
  enableLocationButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  enableLocationText: {
    color: 'white',
    fontWeight: '600',
  },
  tryAgainButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tryAgainText: {
    color: 'white',
    fontWeight: '600',
  },
  resultsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  resultsSubheader: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6B7280',
  },
  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  clearFilterText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  restaurantCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: 192,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 4,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  restaurantDescription: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
  restaurantFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 4,
  },
  separator: {
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  priceText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  closedBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closedText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
  },
});