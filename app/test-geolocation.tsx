import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocation, useNearbyRestaurants } from '../hooks';
import { Stack } from 'expo-router';

export default function TestGeolocationScreen() {
  const { 
    location, 
    loading: locationLoading, 
    error: locationError, 
    getCurrentLocation,
    permission
  } = useLocation();

  const {
    restaurants,
    loading: restaurantsLoading,
    error: restaurantsError,
    refresh,
    refreshing,
    hasLocation
  } = useNearbyRestaurants({
    radiusKm: 10,
    autoRefresh: false, // Disable auto-refresh for testing
  });

  const handleGetLocation = async () => {
    try {
      const result = await getCurrentLocation();
      if (result) {
        Alert.alert('Ubicación obtenida', `Lat: ${result.latitude.toFixed(4)}, Lng: ${result.longitude.toFixed(4)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    }
  };

  const handleRefreshRestaurants = () => {
    if (hasLocation) {
      refresh();
    } else {
      Alert.alert('Ubicación requerida', 'Primero obtén tu ubicación');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Test Geolocalización',
          headerStyle: { backgroundColor: '#3B82F6' },
          headerTintColor: '#fff',
        }} 
      />
      <ScrollView className="flex-1 bg-gray-50">
        <View className="p-4">
          {/* Header */}
          <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              🧪 Prueba del Sistema
            </Text>
            <Text className="text-gray-600">
              Esta pantalla prueba Tailwind CSS y el sistema de geolocalización
            </Text>
          </View>

          {/* Location Status */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              📍 Estado de la Ubicación
            </Text>
            
            {locationLoading && (
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <Text className="text-blue-800 font-medium">
                  🔄 Obteniendo ubicación...
                </Text>
              </View>
            )}

            {location && (
              <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <Text className="text-green-800 font-medium mb-1">
                  ✅ Ubicación obtenida
                </Text>
                <Text className="text-green-700 text-sm">
                  Lat: {location.latitude.toFixed(6)}
                </Text>
                <Text className="text-green-700 text-sm">
                  Lng: {location.longitude.toFixed(6)}
                </Text>
                {location.accuracy && (
                  <Text className="text-green-600 text-xs mt-1">
                    Precisión: ±{Math.round(location.accuracy)}m
                  </Text>
                )}
              </View>
            )}

            {locationError && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <Text className="text-red-800 font-medium">❌ Error</Text>
                <Text className="text-red-700 text-sm mt-1">
                  {locationError}
                </Text>
              </View>
            )}

            {permission && (
              <View className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-3">
                <Text className="text-gray-600 text-xs">
                  Permisos: {permission.status}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleGetLocation}
              disabled={locationLoading}
              className={`rounded-lg px-4 py-3 ${
                locationLoading 
                  ? 'bg-gray-300' 
                  : 'bg-blue-600 active:bg-blue-700'
              }`}
            >
              <Text className={`text-center font-medium ${
                locationLoading ? 'text-gray-500' : 'text-white'
              }`}>
                {locationLoading ? 'Obteniendo...' : 'Obtener Ubicación'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Restaurants */}
          <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                🍽️ Restaurantes Cercanos
              </Text>
              <TouchableOpacity
                onPress={handleRefreshRestaurants}
                disabled={refreshing || !hasLocation}
                className={`rounded px-3 py-1 ${
                  refreshing || !hasLocation 
                    ? 'bg-gray-200' 
                    : 'bg-green-100 active:bg-green-200'
                }`}
              >
                <Text className={`text-sm font-medium ${
                  !hasLocation 
                    ? 'text-gray-400' 
                    : refreshing 
                      ? 'text-gray-600' 
                      : 'text-green-700'
                }`}>
                  {refreshing ? '🔄' : '🔄 Actualizar'}
                </Text>
              </TouchableOpacity>
            </View>

            {restaurantsLoading && !refreshing && (
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <Text className="text-blue-800 text-center">
                  🔄 Cargando restaurantes...
                </Text>
              </View>
            )}

            {restaurantsError && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <Text className="text-red-800 font-medium">❌ Error</Text>
                <Text className="text-red-700 text-sm mt-1">
                  {restaurantsError}
                </Text>
              </View>
            )}

            {!hasLocation && !locationLoading && !restaurantsLoading && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <Text className="text-yellow-800 text-center">
                  ⚠️ Se necesita ubicación para mostrar restaurantes
                </Text>
              </View>
            )}

            {restaurants.length === 0 && hasLocation && !restaurantsLoading && !restaurantsError && (
              <View className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <Text className="text-gray-600 text-center">
                  🏪 No se encontraron restaurantes dentro de 10km
                </Text>
                <Text className="text-gray-500 text-xs text-center mt-1">
                  (Esto es normal si tu API no tiene datos de prueba)
                </Text>
              </View>
            )}

            {restaurants.length > 0 && (
              <View>
                <Text className="text-sm text-green-600 mb-2">
                  ✅ Encontrados {restaurants.length} restaurantes
                </Text>
                {restaurants.slice(0, 3).map((restaurant, index) => (
                  <View 
                    key={restaurant.id || index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2"
                  >
                    <Text className="font-medium text-gray-900">
                      {restaurant.name || 'Restaurante'}
                    </Text>
                    <Text className="text-blue-600 text-sm">
                      📍 {restaurant.formattedDistance}
                    </Text>
                    {restaurant.address && (
                      <Text className="text-gray-500 text-xs mt-1">
                        {restaurant.address}
                      </Text>
                    )}
                  </View>
                ))}
                {restaurants.length > 3 && (
                  <Text className="text-gray-500 text-xs text-center">
                    ... y {restaurants.length - 3} más
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Tailwind Test */}
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              🎨 Prueba de Tailwind CSS
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="bg-red-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">Red</Text>
              </View>
              <View className="bg-blue-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">Blue</Text>
              </View>
              <View className="bg-green-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">Green</Text>
              </View>
              <View className="bg-yellow-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">Yellow</Text>
              </View>
              <View className="bg-purple-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">Purple</Text>
              </View>
            </View>
            <Text className="text-green-600 text-sm mt-3 text-center">
              ✅ Tailwind CSS está funcionando correctamente
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}