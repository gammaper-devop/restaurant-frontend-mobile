import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Dish } from '../types';
import { getImageWithFallback } from '../utils/imageUtils';

interface DishCardProps {
  dish: Dish;
  onPress?: () => void;
}

export function DishCard({ dish, onPress }: DishCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const formatPrice = (price: number | string | null | undefined) => {
    if (price === null || price === undefined) {
      return 'S/ 0.00';
    }
    
    let numPrice: number;
    if (typeof price === 'string') {
      numPrice = parseFloat(price);
      if (isNaN(numPrice)) {
        return 'S/ 0.00';
      }
    } else if (typeof price === 'number') {
      numPrice = price;
    } else {
      return 'S/ 0.00';
    }
    
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(numPrice);
  };

  return (
    <View style={styles.container}>
      {/* Dish Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImageWithFallback('dishes', dish.image) }}
          style={styles.dishImage}
          resizeMode="cover"
        />
        
        {/* Price Badge */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>
            {formatPrice(dish.price)}
          </Text>
        </View>
      </View>

      {/* Dish Info */}
      <View style={styles.dishInfo}>
        <Text style={styles.dishName} numberOfLines={2}>
          {dish.name}
        </Text>
        
        {dish.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.dishDescription} numberOfLines={expanded ? undefined : 3}>
              {dish.description}
            </Text>
            
            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              style={styles.expandButton}
            >
              <Text style={styles.expandButtonText}>
                {expanded ? 'Menos' : 'Más'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Ionicons name="restaurant-outline" size={16} color="#6B7280" />
          <Text style={styles.restaurantName} numberOfLines={1}>
            {dish.restaurant.name}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  dishImage: {
    width: '100%',
    height: 192,
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dishInfo: {
    padding: 16,
  },
  dishName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  dishDescription: {
    color: '#6b7280',
    fontSize: 16,
    lineHeight: 20,
  },
  expandButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 2,
  },
  expandButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantName: {
    color: '#9ca3af',
    marginLeft: 8,
    fontSize: 14,
  },
});
