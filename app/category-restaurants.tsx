import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useLocation, useRestaurantsByCategory } from '../hooks';

const { width, height } = Dimensions.get('window');

export default function CategoryRestaurantsScreen() {
  const router = useRouter();
  const { categoryId, categoryName, categoryIcon } = useLocalSearchParams<{ 
    categoryId: string; 
    categoryName: string; 
    categoryIcon?: string; 
  }>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = new Animated.Value(0);

  const { location: userLocation } = useLocation();

  const {
    restaurants,
    loading,
    error,
    refresh,
    refreshing,
  } = useRestaurantsByCategory(categoryId ? parseInt(categoryId) : null, {
    userLocation,
    radiusKm: 20,
  });

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRestaurantPress = (restaurant: any) => {
    router.push(`/restaurant-details-native?id=${restaurant.id}`);
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [200, 100],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150, 200],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  const renderRestaurantCard = (restaurant: any, index: number) => (
    <Animated.View
      key={restaurant.id || index}
      style={[
        styles.restaurantCard,
        {
          transform: [
            {
              scale: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0.98],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleRestaurantPress(restaurant)}
        activeOpacity={0.9}
      >
        <View style={styles.cardContent}>
          {/* Restaurant Image */}
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: restaurant.imageUrl }}
              style={styles.restaurantImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
              style={styles.imageOverlay}
            />
            
            {/* Favorite Button */}
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={22} color="white" />
            </TouchableOpacity>
            
          </View>

          {/* Restaurant Info */}
          <View style={styles.restaurantInfo}>
            <View style={styles.restaurantHeader}>
              <Text style={styles.restaurantName} numberOfLines={1}>
                {restaurant.name}
              </Text>
              <View style={styles.deliveryInfo}>
                <Ionicons name="bicycle" size={16} color="#059669" />
                <Text style={styles.deliveryTime}>
                  {restaurant.openingHours}
                </Text>
              </View>
            </View>

            <Text style={styles.separator}>•</Text>

            <View style={styles.restaurantFooter}>
              <View style={styles.locationInfo}>
                <Ionicons name="location-outline" size={16} color="#8B5CF6" />
                <Text style={styles.distanceText}>
                  {restaurant.formattedDistance}
                </Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.priceRange}>
                  {restaurant.priceRange}
                </Text>
              </View>
              
              {/* Location is currently open */}
              <View style={[
                styles.statusIndicator,
                restaurant.isOpen ? styles.openIndicator : styles.closedIndicator
                ]}>
                <View style={styles.statusDot} />
                  <Text style={[
                    styles.statusText,
                    restaurant.isOpen ? styles.openText : styles.closedText
                  ]}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>
              </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="restaurant-outline" size={80} color="#E5E7EB" />
      </View>
      <Text style={styles.emptyTitle}>
        No {categoryName} restaurants found
      </Text>
      <Text style={styles.emptyDescription}>
        Try expanding your search area or check back later for new restaurants.
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#059669" />
      <Text style={styles.loadingText}>Finding delicious {categoryName} restaurants...</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Animated Header */}
        <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
          <LinearGradient
            colors={['#059669', '#0D9488']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>

              <Animated.View 
                style={[
                  styles.headerTitleContainer,
                  { transform: [{ translateY: titleTranslateY }] }
                ]}
              >
                <Text style={styles.categoryIcon}>{categoryIcon || '🍽️'}</Text>
                <Text style={styles.headerTitle}>{categoryName} Restaurants</Text>
                <Text style={styles.headerSubtitle}>
                  {filteredRestaurants.length} places found
                </Text>
              </Animated.View>

              <TouchableOpacity style={styles.searchIconButton}>
                <Ionicons name="search" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
            placeholder={`Search ${categoryName} restaurants...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <Animated.ScrollView
          style={styles.content}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentPadding}>
            {loading && filteredRestaurants.length === 0 ? (
              renderLoadingState()
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <TouchableOpacity onPress={refresh} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : filteredRestaurants.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                {/* Filter Summary */}
                <View style={styles.filterSummary}>
                  <Text style={styles.resultsCount}>
                    {filteredRestaurants.length} restaurants
                  </Text>
                  {searchQuery && (
                    <Text style={styles.searchResults}>
                      matching "{searchQuery}"
                    </Text>
                  )}
                </View>

                {/* Restaurant Cards */}
                {filteredRestaurants.map(renderRestaurantCard)}

                {/* Footer Spacing */}
                <View style={styles.footerSpacing} />
              </>
            )}
          </View>
        </Animated.ScrollView>
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
    position: 'relative',
    zIndex: 1,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  searchIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  filterSummary: {
    marginBottom: 20,
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchResults: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  restaurantCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardContent: {
    position: 'relative',
  },
  imageWrapper: {
    position: 'relative',
    height: 220,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  restaurantInfo: {
    padding: 20,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  deliveryTime: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginLeft: 4,
  },
  restaurantDescription: {
    color: '#6B7280',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  restaurantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  distanceText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 6,
  },
  separator: {
    color: '#D1D5DB',
    marginHorizontal: 8,
    fontSize: 14,
  },
  priceRange: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  openIndicator: {
    backgroundColor: '#ecfdf5',
  },
  closedIndicator: {
    backgroundColor: '#fef2f2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  openText: {
    color: '#059669',
  },
  closedText: {
    color: '#dc2626',
  },
  footerSpacing: {
    height: 40,
  },
});