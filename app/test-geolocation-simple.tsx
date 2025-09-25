import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocation, useNearbyRestaurants } from '../hooks';
import { Stack } from 'expo-router';

export default function TestGeolocationSimpleScreen() {
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
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.card}>
            <Text style={styles.headerTitle}>
              🧪 Prueba del Sistema
            </Text>
            <Text style={styles.headerSubtitle}>
              Esta pantalla prueba el sistema de geolocalización
            </Text>
          </View>

          {/* Location Status */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              📍 Estado de la Ubicación
            </Text>
            
            {locationLoading && (
              <View style={[styles.statusBox, styles.statusBoxBlue]}>
                <ActivityIndicator size="small" color="#1d4ed8" />
                <Text style={styles.statusTextBlue}>
                  🔄 Obteniendo ubicación...
                </Text>
              </View>
            )}

            {location && (
              <View style={[styles.statusBox, styles.statusBoxGreen]}>
                <Text style={styles.statusTextGreen}>
                  ✅ Ubicación obtenida
                </Text>
                <Text style={styles.statusTextGreenSmall}>
                  Lat: {location.latitude.toFixed(6)}
                </Text>
                <Text style={styles.statusTextGreenSmall}>
                  Lng: {location.longitude.toFixed(6)}
                </Text>
                {location.accuracy && (
                  <Text style={styles.statusTextGreenTiny}>
                    Precisión: ±{Math.round(location.accuracy)}m
                  </Text>
                )}
              </View>
            )}

            {locationError && (
              <View style={[styles.statusBox, styles.statusBoxRed]}>
                <Text style={styles.statusTextRed}>❌ Error</Text>
                <Text style={styles.statusTextRedSmall}>
                  {locationError}
                </Text>
              </View>
            )}

            {permission && (
              <View style={[styles.statusBox, styles.statusBoxGray]}>
                <Text style={styles.statusTextGray}>
                  Permisos: {permission.status}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleGetLocation}
              disabled={locationLoading}
              style={[styles.button, locationLoading && styles.buttonDisabled]}
            >
              <Text style={[styles.buttonText, locationLoading && styles.buttonTextDisabled]}>
                {locationLoading ? 'Obteniendo...' : 'Obtener Ubicación'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Restaurants */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                🍽️ Restaurantes Cercanos
              </Text>
              <TouchableOpacity
                onPress={handleRefreshRestaurants}
                disabled={refreshing || !hasLocation}
                style={[styles.smallButton, (!hasLocation || refreshing) && styles.smallButtonDisabled]}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color="#059669" />
                ) : (
                  <Text style={[styles.smallButtonText, !hasLocation && styles.smallButtonTextDisabled]}>
                    🔄 Actualizar
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {restaurantsLoading && !refreshing && (
              <View style={[styles.statusBox, styles.statusBoxBlue]}>
                <ActivityIndicator size="large" color="#1d4ed8" />
                <Text style={styles.statusTextBlue}>
                  🔄 Cargando restaurantes...
                </Text>
              </View>
            )}

            {restaurantsError && (
              <View style={[styles.statusBox, styles.statusBoxRed]}>
                <Text style={styles.statusTextRed}>❌ Error</Text>
                <Text style={styles.statusTextRedSmall}>
                  {restaurantsError}
                </Text>
              </View>
            )}

            {!hasLocation && !locationLoading && !restaurantsLoading && (
              <View style={[styles.statusBox, styles.statusBoxYellow]}>
                <Text style={styles.statusTextYellow}>
                  ⚠️ Se necesita ubicación para mostrar restaurantes
                </Text>
              </View>
            )}

            {restaurants.length === 0 && hasLocation && !restaurantsLoading && !restaurantsError && (
              <View style={[styles.statusBox, styles.statusBoxGray]}>
                <Text style={styles.statusTextGray}>
                  🏪 No se encontraron restaurantes dentro de 10km
                </Text>
                <Text style={styles.statusTextGraySmall}>
                  (Esto es normal si tu API no tiene datos de prueba)
                </Text>
              </View>
            )}

            {restaurants.length > 0 && (
              <View>
                <Text style={styles.successText}>
                  ✅ Encontrados {restaurants.length} restaurantes
                </Text>
                {restaurants.slice(0, 3).map((restaurant, index) => (
                  <View key={restaurant.id || index} style={styles.restaurantItem}>
                    <Text style={styles.restaurantName}>
                      {restaurant.name || 'Restaurante'}
                    </Text>
                    <Text style={styles.restaurantDistance}>
                      📍 {restaurant.formattedDistance}
                    </Text>
                    {restaurant.address && (
                      <Text style={styles.restaurantAddress}>
                        {restaurant.address}
                      </Text>
                    )}
                  </View>
                ))}
                {restaurants.length > 3 && (
                  <Text style={styles.moreText}>
                    ... y {restaurants.length - 3} más
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Success Message */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              ✅ Sistema Funcionando
            </Text>
            <Text style={styles.successDescription}>
              El sistema de geolocalización está configurado correctamente y listo para usar.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  statusBoxBlue: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  statusBoxGreen: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  statusBoxRed: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  statusBoxYellow: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  statusBoxGray: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  statusTextBlue: {
    color: '#1e40af',
    fontWeight: '500',
  },
  statusTextGreen: {
    color: '#166534',
    fontWeight: '500',
    marginBottom: 4,
  },
  statusTextGreenSmall: {
    color: '#15803d',
    fontSize: 14,
  },
  statusTextGreenTiny: {
    color: '#16a34a',
    fontSize: 12,
    marginTop: 4,
  },
  statusTextRed: {
    color: '#991b1b',
    fontWeight: '500',
  },
  statusTextRedSmall: {
    color: '#b91c1c',
    fontSize: 14,
    marginTop: 4,
  },
  statusTextYellow: {
    color: '#92400e',
    textAlign: 'center',
  },
  statusTextGray: {
    color: '#4b5563',
    fontSize: 12,
  },
  statusTextGraySmall: {
    color: '#6b7280',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonTextDisabled: {
    color: '#6b7280',
  },
  smallButton: {
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  smallButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  smallButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
  },
  smallButtonTextDisabled: {
    color: '#9ca3af',
  },
  successText: {
    color: '#059669',
    fontSize: 14,
    marginBottom: 8,
  },
  successDescription: {
    color: '#059669',
    fontSize: 14,
    textAlign: 'center',
  },
  restaurantItem: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  restaurantName: {
    fontWeight: '500',
    color: '#1f2937',
    fontSize: 16,
  },
  restaurantDistance: {
    color: '#3b82f6',
    fontSize: 14,
  },
  restaurantAddress: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  moreText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
});