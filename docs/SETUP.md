# Setup Instructions

## 🚀 Configuración de Desarrollo

### 1. **Configurar Backend URL**

Para que la app móvil se conecte correctamente al backend, necesitas configurar la IP correcta.

#### Opción A: Archivo .env.local (Recomendado)
Crea o edita el archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
EXPO_PUBLIC_API_BASE_URL=http://192.168.100.34:3000/api
```

#### Opción B: Encontrar tu IP local
Si tu IP cambió, puedes encontrar la IP correcta:

**En macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**En Windows:**
```bash
ipconfig | findstr "IPv4"
```

### 2. **Verificar que el Backend esté corriendo**

Antes de ejecutar la app móvil, asegúrate de que el backend esté corriendo:

```bash
# Navegar al directorio del backend
cd ../backend

# Iniciar el servidor (si no está corriendo)
npm run dev  # o el comando que uses para iniciar tu backend

# Verificar que funciona
curl http://192.168.100.34:3000/api/restaurants
```

### 3. **Iniciar la App Móvil**

```bash
# En el directorio frontend-mobile
npm start

# O para iOS específicamente
npm run ios
```

## 🐛 Troubleshooting

### Network Errors
Si ves errores como "Network Error":

1. **Verificar IP**: Asegúrate de que la IP en `.env.local` sea correcta
2. **Backend running**: Confirma que el backend esté corriendo en puerto 3000
3. **Firewall**: Verifica que tu firewall permita conexiones en puerto 3000
4. **Same network**: Asegúrate de que tu dispositivo/simulador esté en la misma red

### SafeAreaView Warnings
Si ves warnings sobre SafeAreaView:
- Esto es normal, ya actualizamos el código para usar `react-native-safe-area-context`
- El warning desaparecerá en próximas ejecuciones

### Simulator Issues
Si el simulador no abre:
- Reinicia Metro con `r`
- Presiona `i` para abrir iOS simulator
- O presiona `a` para Android emulator

## 📱 Funcionalidades Disponibles

### Backend Endpoints Utilizados
- `GET /api/restaurants` - Lista de restaurantes
- `GET /api/restaurants/{id}` - Detalles de restaurante
- `GET /api/categories` - Categorías
- `GET /api/dishes/restaurant/{id}` - **NUEVO** - Platos por restaurante

### Nuevas Pantallas
- `/restaurant-dishes` - **NUEVA** - Visualizar platos por restaurante

## 🔄 Cambios Recientes

### Funcionalidad de Platos
- ✅ Servicio API para platos
- ✅ Hook `useDishes` para manejo de estado
- ✅ Componentes `DishCard` y `DishesList`
- ✅ Pantalla `restaurant-dishes`
- ✅ Integración con navegación
- ✅ Configuración de variables de entorno

### Próximas Mejoras
- [ ] Cache local para mejor rendimiento
- [ ] Carrito de compras
- [ ] Filtros por precio/categoría
- [ ] Búsqueda de platos

## 🌐 Variables de Entorno Disponibles

```bash
# .env.local
EXPO_PUBLIC_API_BASE_URL=http://192.168.100.34:3000/api

# Ejemplo para producción
# EXPO_PUBLIC_API_BASE_URL=https://tu-api-produccion.com/api
```

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de la consola
2. Verifica la configuración de red
3. Confirma que el backend esté funcionando
4. Revisa la documentación en `docs/DISHES_FEATURE.md`