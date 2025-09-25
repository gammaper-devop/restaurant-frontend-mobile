import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
  Linking,
  Alert,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/apiService';
import { Restaurant } from '../types';

const { width } = Dimensions.get('window');

export default function RestaurantDetailsNativeScreen() {
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
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading restaurant...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            Restaurant not found
          </Text>
          <Text style={styles.emptyDescription}>
            The restaurant you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.goBackButton}
          >
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContainer}>
          {/* Restaurant Image */}
          <View style={styles.imageSection}>
            <Image
              source={{ uri: restaurant.imageUrl }}
              style={styles.restaurantImage}
              resizeMode="cover"
            />
            
            {/* Header Overlay */}
            <View style={styles.headerOverlay}>
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={20} color="#1F2937" />
              </TouchableOpacity>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color="#1F2937" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={toggleFavorite}
                  style={styles.actionButton}
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
            <View style={styles.statusBadgeContainer}>
              <View style={[styles.statusBadge, restaurant.isOpen ? styles.openBadge : styles.closedBadge]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {restaurant.isOpen ? 'Open Now' : 'Closed'}
                </Text>
              </View>
            </View>
          </View>

          {/* Restaurant Info */}
          <View style={styles.infoContainer}>
            {/* Header */}
            <View style={styles.headerSection}>
              <View style={styles.titleSection}>
                <Text style={styles.restaurantTitle}>
                  {restaurant.name}
                </Text>
                <Text style={styles.restaurantSubtitle}>
                  {restaurant.description}
                </Text>
              </View>
              
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={18} color="#F59E0B" />
                <Text style={styles.ratingScore}>
                  {restaurant.rating}
                </Text>
              </View>
            </View>

            {/* Quick Info */}
            <View style={styles.quickInfoSection}>
              <View style={styles.quickInfoItem}>
                <Ionicons name="bicycle" size={24} color="#059669" />
                <Text style={styles.quickInfoValue}>
                  {restaurant.openingHours}
                </Text>
                <Text style={styles.quickInfoLabel}>Delivery</Text>
              </View>
              
              <View style={styles.quickInfoItem}>
                <Ionicons name="wallet-outline" size={24} color="#3B82F6" />
                <Text style={styles.quickInfoValue}>
                  {restaurant.priceRange}
                </Text>
                <Text style={styles.quickInfoLabel}>Price Range</Text>
              </View>
              
              <View style={styles.quickInfoItem}>
                <Ionicons name="location-outline" size={24} color="#8B5CF6" />
                <Text style={styles.quickInfoValue}>
                  2.5 km
                </Text>
                <Text style={styles.quickInfoLabel}>Distance</Text>
              </View>
            </View>

            {/* Contact Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact & Location</Text>
              
              <View style={styles.contactList}>
                {restaurant.address && (
                  <View style={styles.contactItem}>
                    <Ionicons name="location" size={20} color="#6B7280" />
                    <Text style={styles.contactText}>{restaurant.address}</Text>
                    <TouchableOpacity onPress={handleDirections}>
                      <Text style={styles.contactAction}>Directions</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {restaurant.phone && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={20} color="#6B7280" />
                    <Text style={styles.contactText}>{restaurant.phone}</Text>
                    <TouchableOpacity onPress={handleCall}>
                      <Text style={styles.contactAction}>Call</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Opening Hours */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Opening Hours</Text>
              <View style={styles.hoursContainer}>
                <View style={styles.hoursRow}>
                  <Text style={styles.hoursDay}>Monday - Friday</Text>
                  <Text style={styles.hoursTime}>9:00 AM - 10:00 PM</Text>
                </View>
                <View style={[styles.hoursRow, styles.hoursRowBorder]}>
                  <Text style={styles.hoursDay}>Saturday - Sunday</Text>
                  <Text style={styles.hoursTime}>10:00 AM - 11:00 PM</Text>
                </View>
              </View>
            </View>

            {/* Cuisine Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cuisine</Text>
              <View style={styles.cuisineContainer}>
                {restaurant.cuisine?.split(' • ').map((cuisine, index) => (
                  <View key={index} style={styles.cuisineTag}>
                    <Text style={styles.cuisineText}>{cuisine}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Reviews Summary */}
            <View style={[styles.section, styles.lastSection]}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              <View style={styles.reviewsContainer}>
                <View style={styles.reviewsHeader}>
                  <View style={styles.reviewsLeft}>
                    <Text style={styles.reviewsScore}>{restaurant.rating}</Text>
                    <View style={styles.reviewsDetails}>
                      <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name="star"
                            size={16}
                            color={star <= Math.floor(restaurant.rating || 0) ? "#F59E0B" : "#E5E7EB"}
                          />
                        ))}
                      </View>
                      <Text style={styles.reviewsCount}>Based on 150+ reviews</Text>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.reviewsAction}>See all reviews</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.bottomActions}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              onPress={handleCall}
              style={styles.secondaryActionButton}
            >
              <Ionicons name="call" size={20} color="#374151" />
              <Text style={styles.secondaryActionText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleDirections}
              style={styles.secondaryActionButton}
            >
              <Ionicons name="directions" size={20} color="#374151" />
              <Text style={styles.secondaryActionText}>Directions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.primaryActionButton}>
              <Text style={styles.primaryActionText}>Order Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyDescription: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  goBackButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  goBackText: {
    color: 'white',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
  },
  restaurantImage: {
    width,
    height: 280,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  statusBadgeContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  openBadge: {
    backgroundColor: '#22c55e',
  },
  closedBadge: {
    backgroundColor: '#ef4444',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  infoContainer: {
    padding: 24,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  restaurantTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  restaurantSubtitle: {
    color: '#6B7280',
    fontSize: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ratingScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  quickInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  quickInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  contactText: {
    color: '#374151',
    flex: 1,
    marginLeft: 12,
  },
  contactAction: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  hoursContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  hoursRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  hoursDay: {
    color: '#374151',
  },
  hoursTime: {
    color: '#1F2937',
    fontWeight: '500',
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cuisineTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  cuisineText: {
    color: '#047857',
    fontWeight: '500',
  },
  reviewsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewsScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  reviewsDetails: {
    marginLeft: 12,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewsCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  reviewsAction: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  bottomActions: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
    backgroundColor: 'white',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#374151',
    fontWeight: '500',
    marginTop: 4,
  },
  primaryActionButton: {
    flex: 2,
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});