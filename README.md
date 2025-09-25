# Restaurant App - Frontend Mobile 🍽️📱

Aplicación móvil moderna desarrollada con React Native y Expo para descubrir restaurantes cercanos con geolocalización y navegación intuitiva.

## 🌟 Características Principales

### 🗺️ **Sistema de Geolocalización Avanzado**
- **Ubicación en tiempo real** con expo-location
- **Cálculo preciso de distancias** usando fórmula de Haversine
- **Gestión automática de permisos** con UX optimizada
- **Cache inteligente** de ubicaciones para mejor rendimiento

### 🍕 **Exploración de Restaurantes**
- **Búsqueda por categorías** conectada a backend
- **Lista de restaurantes cercanos** ordenados por distancia  
- **Filtros de búsqueda** por nombre, tipo de cocina y descripción
- **Pantalla de detalles completa** con información, horarios y contacto
- **Estados de apertura** en tiempo real

### 🎨 **Diseño y UX**
- **Diseño moderno y elegante** con NativeWind/Tailwind CSS
- **Navegación fluida** con Expo Router
- **Componentes nativos optimizados** para iOS y Android
- **Estados de carga y error** con feedback visual
- **Animaciones suaves** y transiciones

### 🔧 **Arquitectura Técnica**
- **TypeScript** para tipado estricto y mejor DX
- **Hooks personalizados** reutilizables
- **API service integrado** con backend Node.js
- **Mock data fallback** para desarrollo sin backend
- **Gestión de estado optimizada** con React hooks

## 🚀 Instalación y Configuración

### 📋 Prerrequisitos

- **Node.js** (v18 o superior)
- **npm** o **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Simulador iOS** (macOS) o **Emulador Android**

### 📧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd restaurant_app/frontend-mobile
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno** (opcional)
   ```bash
   cp .env.example .env
   # Editar .env con la URL de tu backend
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   # o con cache limpio
   npx expo start --clear
   ```

## 📱 Ejecución y Pruebas

### 🖥️ En Simulador/Emulador

1. **iOS Simulator:**
   ```bash
   npm run ios
   ```
   - Device > Location > Custom Location
   - Introducir coordenadas (ej: 40.7128, -74.0060 para NYC)

2. **Android Emulator:**
   ```bash
   npm run android  
   ```
   - Extended Controls > Location
   - Establecer coordenadas y presionar "Send"

### 📱 En Dispositivo Físico

1. **Instalar Expo Go** en tu dispositivo
2. **Escanear QR code** desde la terminal
3. **Permitir permisos** de ubicación cuando se soliciten
4. **Navegar por la app** usando las funciones de geolocalización

### 🌍 En Navegador Web

```bash
npm run web
```
> Nota: La geolocalización puede tener limitaciones en el navegador

## 🧭 Arquitectura Técnica

### 🔗 Integración con Backend

La aplicación se conecta al backend Node.js para:

- **Obtener categorías**: `GET /api/categories`
- **Restaurantes por categoría**: `GET /api/restaurants/category/:categoryId`
- **Restaurantes cercanos**: `GET /api/restaurants/nearby`
- **Detalles de restaurante**: `GET /api/restaurants/:id`

### 🔌 Hooks Personalizados

#### `useLocation`
```typescript
const { 
  location,           // UserLocation | null
  loading,            // boolean
  error,             // string | null
  getCurrentLocation, // () => Promise<UserLocation | null>
} = useLocation();
```

#### `useNearbyRestaurants`  
```typescript
const {
  restaurants,       // Array con distancias calculadas
  loading,           // boolean
  refresh,          // () => Promise<void>
  hasLocation,      // boolean
  refreshing        // boolean
} = useNearbyRestaurants({
  radiusKm: 15,
  autoRefresh: true,
  refreshIntervalMs: 60000
});
```

#### `useCategories`
```typescript
const {
  categories,        // Category[]
  loading,          // boolean
  error,           // string | null
  refetch          // () => Promise<void>
} = useCategories();
```

#### `useRestaurantsByCategory`
```typescript
const {
  restaurants,       // Restaurant[]
  loading,          // boolean
  error,           // string | null
  refresh,         // () => Promise<void>
  refreshing       // boolean
} = useRestaurantsByCategory(categoryId, {
  userLocation,
  radiusKm: 20
});
```

## 🎨 Estilos y Diseño

### NativeWind + Tailwind CSS

El proyecto utiliza **NativeWind v4** para aplicar Tailwind CSS de manera nativa:

```tsx
// Ejemplo con estilos Tailwind
<View className="bg-white rounded-2xl p-5 shadow-lg">
  <Text className="text-xl font-bold text-gray-900 mb-2">
    Restaurante
  </Text>
  <TouchableOpacity className="bg-emerald-600 rounded-xl px-6 py-3">
    <Text className="text-white text-center font-semibold">Ver Detalles</Text>
  </TouchableOpacity>
</View>
```

### Estilos Nativos (Alternativa)

También incluye implementaciones con StyleSheet nativo para mayor compatibilidad:

```tsx
// Ejemplo con estilos nativos
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 3,
  }
});
```

## 🗂️ Estructura del Proyecto

```
frontend-mobile/
├── app/                          # Pantallas de la aplicación (Expo Router)
│   ├── index.tsx                # Pantalla principal de inicio
│   ├── restaurants-native.tsx   # Lista de restaurantes
│   ├── category-restaurants.tsx # Restaurantes por categoría
│   ├── restaurant-details-native.tsx # Detalles del restaurante
│   ├── test-geolocation-simple.tsx  # Prueba de geolocalización
│   └── _layout.tsx              # Layout principal de la app
│
├── hooks/                        # Hooks personalizados reutilizables
│   ├── useLocation.ts          # Geolocalización y permisos
│   ├── useNearbyRestaurants.ts # Restaurantes cercanos
│   ├── useCategories.ts        # Categorías de restaurantes
│   ├── useRestaurantsByCategory.ts # Restaurantes filtrados
│   └── index.ts                # Barrel export de hooks
│
├── services/                     # Servicios y APIs
│   ├── locationService.ts      # Servicio de geolocalización
│   └── apiService.ts           # Cliente HTTP y API
│
├── types/                        # Definiciones de tipos TypeScript
│   └── index.ts                # Tipos de datos (Restaurant, Category, etc.)
│
├── utils/                        # Utilidades y helpers
│   └── locationUtils.ts        # Cálculos de distancia y ubicación
│
├── assets/                       # Recursos estáticos
│   ├── images/
│   └── fonts/
│
└── docs/                         # Documentación del proyecto
    └── GEOLOCATION.md          # Documentación técnica
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start                    # Iniciar servidor de desarrollo de Expo
npm run android              # Abrir en emulador/dispositivo Android
npm run ios                  # Abrir en simulador iOS (solo macOS)
npm run web                  # Abrir versión web en navegador

# Utilidades
npm run lint                 # Ejecutar ESLint para revisar código
npm run reset-project        # Resetear configuración del proyecto

# Desarrollo con opciones
npx expo start --clear       # Iniciar limpiando caché de Metro
npx expo start --tunnel      # Usar túnel para dispositivos remotos
npx expo start --localhost   # Solo acceso local
```

## 🐛 Solución de Problemas

### 🐞 Errores Comunes

**Error: "Cannot find module 'nativewind/metro'"**
```bash
npx expo start --clear
rm -rf node_modules && npm install
```

**Tailwind CSS no se aplica**
1. Verificar importación de `global.css` en `_layout.tsx`
2. Limpiar caché: `npx expo start --clear`
3. Verificar configuración de `tailwind.config.js` y `nativewind.config.js`

**Problemas con TypeScript**
```bash
npx expo install --fix
npm run lint
```

### 📍 Geolocalización

**Permisos de ubicación**
1. Verificar configuración en `app.json`:
   ```json
   {
     "expo": {
       "plugins": [
         [
           "expo-location",
           {
             "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
           }
         ]
       ]
     }
   }
   ```
2. Reiniciar la app después de cambios de permisos
3. Verificar configuración del dispositivo/simulador

**Ubicación no funciona en simulador**
- **iOS**: Device > Location > Custom Location
- **Android**: Extended Controls > Location > Set coordinates

### 🔌 Conectividad con Backend

**API no disponible**
- La app funciona con datos mock cuando el backend no está disponible
- Verificar URL en `apiService.ts`: `API_BASE_URL`
- Comprobar que el backend esté ejecutándose en el puerto correcto

## 📚 Stack Tecnológico

### 📱 **Frontend Mobile**
- **React Native** `0.81.4` - Framework principal
- **Expo** `~54.0.10` - Herramientas de desarrollo
- **TypeScript** `~5.9.2` - Tipado estático
- **Expo Router** `~6.0.8` - Navegación file-based

### 🎨 **Estilos y UI**
- **NativeWind** `^4.0.1` - Tailwind CSS para React Native
- **Tailwind CSS** `^3.4.0` - Framework de utilidades CSS
- **Expo Vector Icons** `^15.0.2` - Iconografía
- **Expo Linear Gradient** `~15.0.7` - Gradientes

### 🗺️ **Geolocalización y Maps**
- **Expo Location** `~19.0.7` - Servicios de ubicación
- **React Native SVG** `15.12.1` - Gráficos vectoriales

### 🔌 **Networking y APIs**
- **Axios** `^1.7.9` - Cliente HTTP
- **Expo Constants** `~18.0.9` - Constantes de configuración

### 🛠️ **Herramientas de Desarrollo**
- **ESLint** `^9.25.0` - Linter de código
- **Expo CLI** - Herramientas de desarrollo
- **Metro Bundler** - Bundler para React Native

## 📚 Enlaces Útiles

### 📝 **Documentación Oficial**
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Expo Router Guide](https://docs.expo.dev/routing/introduction/)

### 🎨 **Estilos y Diseño**
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Expo Vector Icons Directory](https://icons.expo.fyi/)

### 🗺️ **Geolocalización**
- [Expo Location API](https://docs.expo.dev/versions/latest/sdk/location/)
- [Documentación interna de Geolocalización](./docs/GEOLOCATION.md)

---

## 🚀 Contribuciones

Este proyecto fue desarrollado como parte del sistema Restaurant App. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y está bajo la licencia del propietario.

---

**Desarrollado con ❤️ usando React Native + Expo**
