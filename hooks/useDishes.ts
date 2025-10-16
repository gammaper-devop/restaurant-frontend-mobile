import { useCallback, useEffect, useState } from 'react';
import { Dish } from '../types';
import { dishService } from '../services/api';

interface UseDishesState {
  dishes: Dish[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

interface UseDishesResult extends UseDishesState {
  fetchDishesByRestaurant: (restaurantId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useDishes(restaurantId?: number): UseDishesResult {
  const [state, setState] = useState<UseDishesState>({
    dishes: [],
    loading: false,
    error: null,
    refreshing: false,
  });

  const fetchDishesByRestaurant = useCallback(async (id: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const dishes = await dishService.getByRestaurant(id);
      setState(prev => ({
        ...prev,
        dishes,
        loading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setState(prev => ({
        ...prev,
        dishes: [],
        loading: false,
        error: 'Failed to load dishes',
      }));
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!restaurantId) return;
    
    setState(prev => ({ ...prev, refreshing: true, error: null }));
    
    try {
      const dishes = await dishService.getByRestaurant(restaurantId);
      setState(prev => ({
        ...prev,
        dishes,
        refreshing: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error refreshing dishes:', error);
      setState(prev => ({
        ...prev,
        refreshing: false,
        error: 'Failed to refresh dishes',
      }));
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) {
      fetchDishesByRestaurant(restaurantId);
    }
  }, [restaurantId, fetchDishesByRestaurant]);

  return {
    ...state,
    fetchDishesByRestaurant,
    refresh,
  };
}