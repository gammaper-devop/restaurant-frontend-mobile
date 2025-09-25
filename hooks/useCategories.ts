import { useState, useEffect } from 'react';
import { Category } from '../types';
import { apiService } from '../services/apiService';

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export const useCategories = () => {
  const [state, setState] = useState<CategoriesState>({
    categories: [],
    loading: false,
    error: null,
  });

  const fetchCategories = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const categories = await apiService.getCategories();
      setState(prev => ({
        ...prev,
        categories,
        loading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
      setState(prev => ({
        ...prev,
        categories: [],
        loading: false,
        error: errorMessage,
      }));
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    ...state,
    refetch: fetchCategories,
  };
};