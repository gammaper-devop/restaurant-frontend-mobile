# Dishes by Restaurant Feature

Esta documentación describe la nueva funcionalidad implementada para visualizar platos por restaurante en la aplicación móvil.

## 🚀 Características Implementadas

### 1. **Servicio API para Platos**
- **Archivo**: `services/api.ts`
- **Funciones**:
  - `dishService.getAll()` - Obtener todos los platos activos
  - `dishService.getById(id)` - Obtener plato por ID
  - `dishService.getByRestaurant(restaurantId)` - Obtener platos por restaurante

### 2. **Hook Personalizado**
- **Archivo**: `hooks/useDishes.ts`
- **Funciones**:
  - Manejo automático de estados (loading, error, refreshing)
  - Función de refresh con pull-to-refresh
  - Carga automática de datos por restaurante

### 3. **Componentes de UI**

#### DishCard
- **Archivo**: `components/DishCard.tsx`
- **Características**:
  - Tarjeta moderna con imagen del plato
  - Precio destacado con badge
  - Información del restaurante
  - Sombras y efectos visuales

#### DishesList
- **Archivo**: `components/DishesList.tsx`
- **Características**:
  - Lista con pull-to-refresh
  - Estados de loading, error y vacío
  - Scroll optimizado con separadores

### 4. **Pantalla Principal**
- **Archivo**: `app/restaurant-dishes.tsx`
- **Características**:
  - Header personalizado con navegación
  - Estadísticas del restaurante
  - Integración completa con componentes

## 🎨 Diseño y Estilo

### Colores Utilizados
- **Primary**: Rojo (#EF4444) - Para botones principales y acentos
- **Gray Scale**: Escala de grises para texto y fondos
- **Success**: Verde para estados positivos
- **Warning**: Amarillo para alertas

### Tipografía
- **Títulos**: Font weight bold, tamaños 2xl, xl, lg
- **Texto regular**: Base y small sizes
- **Colores**: Gray-900 para títulos, Gray-600 para texto secundario

### Efectos Visuales
- **Sombras**: `shadowColor: '#000', shadowOpacity: 0.1`
- **Bordes**: Rounded corners (2xl, xl)
- **Gradientes**: Primary colors para botones destacados

## 🔧 Integración

### Navegación
La funcionalidad se integra con la pantalla de detalles del restaurante (`restaurant-details.tsx`) mediante:

1. **Botón destacado** en la sección de menú
2. **Botón en la barra inferior** de acciones
3. **Navegación** usando expo-router con parámetros

```typescript
router.push({
  pathname: '/restaurant-dishes',
  params: { 
    restaurantId: restaurant.id.toString(),
    restaurantName: restaurant.name 
  }
});
```

## 📱 Funcionalidades de UX

### Estados de Loading
- **Inicial**: Spinner con mensaje "Loading dishes..."
- **Refresh**: Pull-to-refresh nativo de React Native
- **Error**: Pantalla con icono y mensaje descriptivo
- **Vacío**: Mensaje amigable cuando no hay platos

### Interacciones
- **Tap en plato**: Muestra alert con detalles (preparado para carrito)
- **Pull-to-refresh**: Recarga los datos
- **Navegación**: Botón back funcional

## 🔌 Backend Integration

### Endpoints Utilizados
- `GET /api/dishes/restaurant/{restaurantId}` - Platos por restaurante
- `GET /api/dishes/{id}` - Plato individual
- `GET /api/dishes` - Todos los platos

### Estructura de Datos
```typescript
interface Dish {
  id: number;
  name: string;
  description?: string;
  image?: string;
  price: number;
  restaurant: {
    id: number;
    name: string;
  };
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

## 🚦 Cómo Usar

### 1. Desde la pantalla de restaurantes
1. Navegar a cualquier restaurante
2. Ver detalles del restaurante
3. Hacer tap en "View Menu" o "Menu"

### 2. Programáticamente
```typescript
import { useDishes } from '../hooks/useDishes';

// En un componente
const { dishes, loading, error, refresh } = useDishes(restaurantId);
```

## 🔮 Mejoras Futuras

### Funcionalidades Sugeridas
1. **Carrito de compras**: Agregar platos al carrito
2. **Filtros**: Por precio, categoría, ingredientes
3. **Búsqueda**: Buscar platos específicos
4. **Favoritos**: Marcar platos como favoritos
5. **Reseñas**: Sistema de ratings para platos
6. **Personalización**: Modificar ingredientes o tamaño

### Optimizaciones Técnicas
1. **Caching**: Implementar cache local para mejor rendimiento
2. **Paginación**: Para restaurantes con muchos platos
3. **Imágenes**: Lazy loading y optimización de imágenes
4. **Offline**: Soporte para modo offline

## 🐛 Troubleshooting

### Problemas Comunes
1. **No se cargan platos**: Verificar conexión a backend
2. **Imágenes no aparecen**: Verificar URLs de imágenes por defecto
3. **Navigation error**: Verificar que expo-router esté configurado

### Logs Útiles
- Todos los errores se logean en consola con prefijo del servicio
- Estados de loading se pueden monitorear en development

## 🏗️ Arquitectura

### Patrón Utilizado
- **Clean Architecture**: Separación clara entre UI, hooks y servicios
- **Component Composition**: Componentes reutilizables y composables
- **Custom Hooks**: Lógica de estado encapsulada

### Estructura de Archivos
```
├── app/
│   └── restaurant-dishes.tsx     # Pantalla principal
├── components/
│   ├── DishCard.tsx             # Tarjeta de plato
│   └── DishesList.tsx           # Lista de platos
├── hooks/
│   └── useDishes.ts             # Hook personalizado
├── services/
│   └── api.ts                   # Servicio API
└── types/
    └── index.ts                 # Tipos TypeScript
```

Esta implementación sigue las mejores prácticas de React Native y proporciona una experiencia de usuario fluida y moderna.