import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

// TypeScript declaration for __DEV__
declare const __DEV__: boolean;
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { apiService } from '../services/apiService';
import { Restaurant, RestaurantLocation, DaySchedule, OperatingHours } from '../types';
import { getImageWithFallback } from '../utils/imageUtils';

const { width } = Dimensions.get('window');

/**
 * Format time from 24-hour format to 12-hour format
 * @param time Time in format "HH:MM"
 * @returns Formatted time string
 */
const formatTime = (time: string): string => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Get current day name
 * @returns Current day name in lowercase
 */
const getCurrentDay = (): keyof OperatingHours => {
  const days: (keyof OperatingHours)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date().getDay();
  return days[today];
};

/**
 * Check if two day schedules are the same
 * @param day1 First day schedule
 * @param day2 Second day schedule
 * @returns True if schedules are identical
 */
const areSameSchedule = (day1: DaySchedule, day2: DaySchedule): boolean => {
  return day1.open === day2.open && day1.close === day2.close && day1.closed === day2.closed;
};

/**
 * Group consecutive days with same schedule
 * @param operatingHours Operating hours for all days
 * @returns Array of grouped schedule ranges
 */
const groupOperatingHours = (operatingHours: OperatingHours) => {
  const daysOrder: (keyof OperatingHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels: Record<keyof OperatingHours, string> = {
    monday: 'Mon',
    tuesday: 'Tue', 
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };
  
  const groups: { days: string; schedule: DaySchedule; isToday: boolean }[] = [];
  let currentGroup: (keyof OperatingHours)[] = [];
  let currentSchedule: DaySchedule | null = null;
  const today = getCurrentDay();
  
  for (const day of daysOrder) {
    const schedule = operatingHours[day];
    
    if (!currentSchedule || !areSameSchedule(currentSchedule, schedule)) {
      // Start new group
      if (currentGroup.length > 0) {
        const dayRange = currentGroup.length === 1 
          ? dayLabels[currentGroup[0]]
          : `${dayLabels[currentGroup[0]]} - ${dayLabels[currentGroup[currentGroup.length - 1]]}`;
        
        groups.push({
          days: dayRange,
          schedule: currentSchedule!,
          isToday: currentGroup.includes(today)
        });
      }
      
      currentGroup = [day];
      currentSchedule = schedule;
    } else {
      // Add to current group
      currentGroup.push(day);
    }
  }
  
  // Add the last group
  if (currentGroup.length > 0 && currentSchedule) {
    const dayRange = currentGroup.length === 1 
      ? dayLabels[currentGroup[0]]
      : `${dayLabels[currentGroup[0]]} - ${dayLabels[currentGroup[currentGroup.length - 1]]}`;
    
    groups.push({
      days: dayRange,
      schedule: currentSchedule,
      isToday: currentGroup.includes(today)
    });
  }
  
  return groups;
};

export default function RestaurantDetailsNativeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [restaurantLocations, setRestaurantLocations] = useState<RestaurantLocation | null>(null);
  const [isCurrentlyOpen, setIsCurrentlyOpen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadRestaurantDetails();
  }, [id]);

  const loadRestaurantDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const restaurantData = await apiService.getRestaurantById(parseInt(id));
      setRestaurant(restaurantData);
      
      const restaurantLocationsData = await apiService.getRestaurantLocationsByRestaurantId(parseInt(id));
      const firstLocation = restaurantLocationsData[0];
      setRestaurantLocations(firstLocation);
      
      // Check if the location is currently open
      if (firstLocation) {
        try {
          const openStatus = await apiService.isLocationCurrentlyOpen(firstLocation.id);
          setIsCurrentlyOpen(openStatus);
        } catch (error) {
          if (__DEV__) {
            console.warn('Failed to check open status:', error);
          }
          // Fall back to static value if available
          setIsCurrentlyOpen(restaurantData?.isOpen || false);
        }
      } else {
        // Fall back to static value from restaurant data
        setIsCurrentlyOpen(restaurantData?.isOpen || false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (restaurantLocations?.phone) {
      Linking.openURL(`tel:${restaurantLocations?.phone}`);
    }
  };

  const handleDirections = () => {
    if (restaurantLocations?.latitude && restaurantLocations?.longitude) {
      const url = `https://maps.google.com/?q=${restaurantLocations.latitude},${restaurantLocations.longitude}`;
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
              source={{ uri: getImageWithFallback('restaurants', restaurant.imageUrl) }}
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
              <View style={[
                styles.statusBadge, 
                isCurrentlyOpen === null ? styles.checkingBadge : (isCurrentlyOpen ? styles.openBadge : styles.closedBadge)
              ]}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                  {isCurrentlyOpen === null ? 'Checking...' : (isCurrentlyOpen ? 'Open Now' : 'Closed')}
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
                    <Text style={styles.contactText}>{restaurantLocations?.address}</Text>
                    <TouchableOpacity onPress={handleDirections}>
                      <Text style={styles.contactAction}>Directions</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {restaurantLocations?.phone && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={20} color="#6B7280" />
                    <Text style={styles.contactText}>{restaurantLocations?.phone}</Text>
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
                {restaurantLocations?.operatingHours ? (
                  groupOperatingHours(restaurantLocations.operatingHours).map((group, index, array) => (
                    <View 
                      key={`${group.days}-${index}`} 
                      style={[
                        styles.hoursRow, 
                        index > 0 && styles.hoursRowBorder,
                        group.isToday && styles.todayRow
                      ]}
                    >
                      <View style={styles.hoursLeftSection}>
                        <Text style={[
                          styles.hoursDay,
                          group.isToday && styles.todayText
                        ]}>
                          {group.days}
                        </Text>
                        {group.isToday && (
                          <View style={styles.todayIndicator}>
                            <Text style={styles.todayLabel}>Today</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={[
                        styles.hoursTime,
                        group.isToday && styles.todayTimeText,
                        group.schedule.closed && styles.closedText
                      ]}>
                        {group.schedule.closed 
                          ? 'Closed' 
                          : `${formatTime(group.schedule.open)} - ${formatTime(group.schedule.close)}`
                        }
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.hoursRow}>
                    <Text style={styles.hoursDay}>Hours information</Text>
                    <Text style={styles.hoursTime}>Not available</Text>
                  </View>
                )}
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
              <Ionicons name="navigate-outline" size={20} color="#374151" />
              <Text style={styles.secondaryActionText}>Directions</Text>
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
  checkingBadge: {
    backgroundColor: '#6b7280',
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
  hoursLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  todayRow: {
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
  },
  todayText: {
    color: '#059669',
    fontWeight: '600',
  },
  todayTimeText: {
    color: '#059669',
    fontWeight: '600',
  },
  todayIndicator: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  todayLabel: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  closedText: {
    color: '#EF4444',
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