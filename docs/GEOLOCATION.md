# Sistema de Geolocalización

El sistema de geolocalización está construido con React Native, Expo Location y proporciona funcionalidades completas para obtener la ubicación del usuario y calcular distancias a restaurantes cercanos.

## Estructura de Archivos

```
├── hooks/
│   ├── useLocation.ts              # Hook principal para geolocalización
│   ├── useNearbyRestaurants.ts     # Hook para restaurantes cercanos
│   └── index.ts                    # Exports de hooks
├── services/
│   └── locationService.ts          # Servicio centralizado de geolocalización
├── utils/
│   └── locationUtils.ts            # Utilidades para cálculos de distancia
├── components/
│   └── LocationExample.tsx         # Componente de ejemplo
└── docs/
    └── GEOLOCATION.md              # Esta documentación
```

## Configuración

### 1. Dependencias Requeridas

```json
{
  "expo-location": "^17.0.1"
}
```

### 2. Permisos de Ubicación

Los permisos están configurados en `app.json`:

**iOS:**
```json
"infoPlist": {
  "NSLocationWhenInUseUsageDescription": "This app uses location to find nearby restaurants and show your current position.",
  "NSLocationAlwaysAndWhenInUseUsageDescription": "This app uses location to find nearby restaurants and show your current position."
}
```

**Android:**
```json
"permissions": [
  "ACCESS_FINE_LOCATION",
  "ACCESS_COARSE_LOCATION"
]
```

## API y Hooks

### useLocation Hook

Hook principal para manejo de geolocalización:

```typescript
import { useLocation } from '../hooks/useLocation';

const {
  location,        // UserLocation | null
  loading,         // boolean
  error,           // string | null
  permission,      // LocationPermissionResponse | null
  getCurrentLocation,
  watchLocation,
  requestPermission
} = useLocation();
```

**Métodos:**
- `getCurrentLocation()`: Obtiene ubicación actual
- `watchLocation(callback)`: Observa cambios de ubicación
- `requestPermission()`: Solicita permisos

### useNearbyRestaurants Hook

Hook especializado para obtener restaurantes cercanos:

```typescript
import { useNearbyRestaurants } from '../hooks/useNearbyRestaurants';

const {
  restaurants,     // Array con distancias calculadas
  loading,         // boolean
  error,           // string | null
  refreshing,      // boolean
  refresh,         // () => Promise<void>
  userLocation,    // UserLocation | null
  locationLoading, // boolean
  hasLocation      // boolean
} = useNearbyRestaurants({
  radiusKm: 10,              // Radio de búsqueda (default: 10km)
  autoRefresh: true,         // Auto-refresh (default: true)
  refreshIntervalMs: 30000   // Intervalo de refresh (default: 30s)
});
```

## Servicios

### LocationService (Singleton)

Servicio centralizado para operaciones de geolocalización:

```typescript
import { locationService } from '../services/locationService';

// Obtener ubicación actual
const location = await locationService.getCurrentPosition();

// Verificar permisos
const { granted } = await locationService.checkPermissions();

// Iniciar observación
const cleanup = await locationService.startWatching((location) => {
  console.log('Nueva ubicación:', location);
});

// Geocoding y reverse geocoding
const addresses = await locationService.reverseGeocode(location);
const coordinates = await locationService.geocode('123 Main St');

// Verificar si los servicios están habilitados
const isEnabled = await locationService.isLocationServicesEnabled();
```

## Utilidades de Ubicación

### Cálculo de Distancias

```typescript
import { 
  calculateDistance,
  formatDistance,
  sortRestaurantsByDistance,
  filterRestaurantsWithinRadius,
  getNearestRestaurant
} from '../utils/locationUtils';

// Calcular distancia entre dos puntos
const distance = calculateDistance(
  { latitude: 40.7128, longitude: -74.0060 }, // NYC
  { latitude: 34.0522, longitude: -118.2437 } // LA
); // Resultado en kilómetros

// Formatear distancia para mostrar
const formatted = formatDistance(1.5); // "1.5km"
const formatted2 = formatDistance(0.8); // "800m"

// Ordenar restaurantes por distancia
const sorted = sortRestaurantsByDistance(restaurants, userLocation);

// Filtrar dentro de un radio específico
const nearby = filterRestaurantsWithinRadius(restaurants, userLocation, 5);

// Obtener el más cercano
const nearest = getNearestRestaurant(restaurants, userLocation);
```

## Tipos TypeScript

### UserLocation

```typescript
interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}
```

### Restaurant (con distancia)

Los hooks y utilidades añaden información de distancia:

```typescript
type RestaurantWithDistance = Restaurant & {
  distance: number;           // Distancia en kilómetros
  formattedDistance: string;  // Distancia formateada ("1.5km", "800m")
};
```

## Uso Básico

### 1. Obtener Ubicación Actual

```typescript
import { useLocation } from '../hooks/useLocation';

const MyComponent = () => {
  const { location, loading, error, getCurrentLocation } = useLocation();

  const handleGetLocation = async () => {
    try {
      const currentLocation = await getCurrentLocation();
      console.log('Ubicación:', currentLocation);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <Text>Obteniendo ubicación...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  if (location) return <Text>Lat: {location.latitude}, Lng: {location.longitude}</Text>;

  return <Button title="Obtener Ubicación" onPress={handleGetLocation} />;
};
```

### 2. Mostrar Restaurantes Cercanos

```typescript
import { useNearbyRestaurants } from '../hooks/useNearbyRestaurants';

const RestaurantList = () => {
  const { 
    restaurants, 
    loading, 
    error, 
    refresh 
  } = useNearbyRestaurants({
    radiusKm: 5,
    autoRefresh: true
  });

  if (loading) return <Text>Cargando restaurantes...</Text>;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={restaurants}
      refreshing={loading}
      onRefresh={refresh}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          <Text>📍 {item.formattedDistance}</Text>
        </View>
      )}
    />
  );
};
```

### 3. Observar Cambios de Ubicación

```typescript
import { useLocation } from '../hooks/useLocation';

const LocationTracker = () => {
  const { watchLocation } = useLocation();

  useEffect(() => {
    const cleanup = watchLocation((newLocation) => {
      console.log('Nueva ubicación:', newLocation);
    });

    return cleanup; // Cleanup automático
  }, [watchLocation]);

  return <Text>Rastreando ubicación...</Text>;
};
```

## Manejo de Errores

El sistema incluye manejo comprehensivo de errores:

- **Permission denied**: Usuario denegó permisos
- **Position unavailable**: GPS deshabilitado o sin señal
- **Timeout**: Tiempo de espera agotado
- **Service unavailable**: Servicio de ubicación no disponible

## Mejores Prácticas

### 1. Gestión de Permisos

```typescript
const { permission, requestPermission } = useLocation();

// Verificar permisos antes de usar
if (!permission || permission.status !== 'granted') {
  await requestPermission();
}
```

### 2. Cachear Ubicaciones

```typescript
import { locationService } from '../services/locationService';

// El servicio automáticamente cachea la última ubicación conocida
const lastKnown = locationService.getLastKnownLocation();
if (lastKnown) {
  // Usar ubicación en cache
}
```

### 3. Optimizar Accuracy vs Battery

```typescript
const location = await locationService.getCurrentPosition({
  accuracy: Location.Accuracy.Balanced, // Balance entre precisión y batería
  maximumAge: 10000 // Usar cache si es reciente
});
```

### 4. Cleanup de Observadores

```typescript
useEffect(() => {
  const cleanup = watchLocation(callback);
  return cleanup; // Importante: limpiar al desmontar
}, []);
```

## Configuración de Desarrollo

Para probar en simulador/emulador:

### iOS Simulator
- **Device > Location > Custom Location**: Establecer coordenadas
- **Device > Location > Apple**: Usar ubicación de Apple Park

### Android Emulator
- **Extended Controls > Location**: Establecer coordenadas
- **Send**: Enviar ubicación al emulador

## Solución de Problemas

### Errores Comunes

1. **"Location permission denied"**
   - Verificar configuración en `app.json`
   - Verificar permisos del dispositivo
   - Llamar `requestPermission()` explícitamente

2. **"Location services disabled"**
   - Verificar GPS habilitado en dispositivo
   - Usar `locationService.isLocationServicesEnabled()`

3. **"Position unavailable"**
   - Verificar conectividad
   - Mover a ubicación con mejor señal GPS
   - Aumentar timeout en configuración

4. **Precisión baja**
   - Usar `Location.Accuracy.High` para máxima precisión
   - Esperar a que el GPS se estabilice
   - Verificar que el dispositivo tenga GPS

Este sistema proporciona una base sólida y extensible para todas las necesidades de geolocalización en tu aplicación React Native.