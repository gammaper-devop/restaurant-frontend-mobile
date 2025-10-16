import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DishesList } from '../components/DishesList';
import { useDishes } from '../hooks/useDishes';
import { apiService } from '../services/apiService';
import { Dish, Restaurant } from '../types';

const { width, height } = Dimensions.get('window');

export default function RestaurantDishesScreen() {
  const router = useRouter();
  const { restaurantId, restaurantName } = useLocalSearchParams<{ 
    restaurantId: string; 
    restaurantName?: string; 
  }>();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = new Animated.Value(0);
  const restaurantIdNum = restaurantId ? parseInt(restaurantId) : undefined;
  const { dishes, loading, error, refreshing, refresh } = useDishes(restaurantIdNum);

  // Filtrar platos por búsqueda
  const filteredDishes = dishes.filter(dish =>
    dish.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Animaciones del header
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

  useEffect(() => {
    loadRestaurantInfo();
  }, [restaurantId]);

  const loadRestaurantInfo = async () => {
    if (!restaurantId) return;
    
    try {
      const data = await apiService.getRestaurantById(parseInt(restaurantId));
      setRestaurant(data);
    } catch (error) {
      console.error('Error loading restaurant info:', error);
    }
  };

  const handleDishPress = (dish: Dish) => {
    // Debug log temporal
    if (__DEV__) {
      console.log('🍽️ Dish pressed:', {
        name: dish.name,
        price: dish.price,
        priceType: typeof dish.price,
        description: dish.description
      });
    }
    
    let priceStr = '0.00';
    if (typeof dish.price === 'number') {
      priceStr = dish.price.toFixed(2);
    } else if (typeof dish.price === 'string') {
      const numPrice = parseFloat(dish.price);
      priceStr = isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    }
    Alert.alert(
      dish.name,
      `Price: $${priceStr}${dish.description ? `\n\n${dish.description}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add to Cart', style: 'default' },
      ]
    );
  };

  const displayName = restaurantName || restaurant?.name || 'Restaurant';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
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

              <View style={styles.headerTitleContainer}>
                <Text style={styles.categoryIcon}>🍽️</Text>
                <Text style={styles.headerTitle}>{displayName}</Text>
                <Text style={styles.headerSubtitle}>
                  {filteredDishes.length} dishes found
                </Text>
              </View>

              <TouchableOpacity style={styles.searchIconButton}>
                <Ionicons name="search" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder={`Search ${displayName} dishes...`}
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
        <View style={styles.content}>
          {/* Filter Summary */}
          <View style={styles.filterSummary}>
            <Text style={styles.resultsCount}>
              {filteredDishes.length} dishes
            </Text>
            {searchQuery && (
              <Text style={styles.searchResults}>
                matching "{searchQuery}"
              </Text>
            )}
          </View>

          {/* Dishes List */}
          <DishesList
            dishes={filteredDishes}
            loading={loading}
            refreshing={refreshing}
            error={error}
            onRefresh={refresh}
            onDishPress={handleDishPress}
          />
        </View>
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
    height: 200,
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
  filterSummary: {
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
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
});
