import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Dish } from '../types';
import { DishCard } from './DishCard';

interface DishesListProps {
  dishes: Dish[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  onDishPress?: (dish: Dish) => void;
}

export function DishesList({
  dishes,
  loading,
  refreshing,
  error,
  onRefresh,
  onDishPress
}: DishesListProps) {

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading dishes...</Text>
      </View>
    );
  }

  // Error state
  if (error && !loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>
          Oops! Something went wrong
        </Text>
        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  // Empty state
  if (!loading && dishes.length === 0 && !error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>
          No dishes available
        </Text>
        <Text style={styles.emptyText}>
          This restaurant doesn't have any dishes available at the moment.
        </Text>
      </View>
    );
  }

  // Render dish item
  const renderDish = ({ item }: { item: Dish }) => (
    <DishCard
      dish={item}
      onPress={() => onDishPress?.(item)}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dishes}
        renderItem={renderDish}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EF4444"
            title="Pull to refresh"
            titleColor="#6B7280"
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
  },
  listContent: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  separator: {
    height: 8,
  },
});
