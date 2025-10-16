# Debug: View Menu Button Issue

## 🔍 Problema
El botón rojo "View Menu" no se visualiza en las tarjetas de restaurante.

## ✅ Cambios Realizados

### 1. **Reemplazado Tailwind con StyleSheet**
- Cambiado `bg-primary-500` → `backgroundColor: '#EF4444'`
- Cambiado `space-x-2` → `gap: 8`
- Todos los estilos ahora usan StyleSheet en lugar de Tailwind

### 2. **Agregados Logs de Debug**
- Log cuando se renderiza cada tarjeta de restaurante
- Log cuando se presiona "View Menu"

### 3. **Pantalla de Prueba**
- Creada `/test-buttons` para probar los botones aisladamente

## 🧪 Pasos para Verificar

### 1. **Verificar Pantalla de Prueba**
```
1. Navegar a /test-buttons en la app
2. Deberías ver dos conjuntos de botones
3. El botón "View Menu" debe ser ROJO (#EF4444)
4. Presiona los botones y verifica logs en consola
```

### 2. **Verificar Lista de Restaurantes**
```
1. Navegar a /restaurants
2. Buscar en consola logs: "🍽️ Rendering restaurant card:"
3. Cada tarjeta debe tener dos botones en la parte inferior
4. Botón izquierdo: "Details" (gris)
5. Botón derecho: "View Menu" (rojo)
```

### 3. **Verificar Navegación**
```
1. Presionar "View Menu" en cualquier restaurante
2. Debe aparecer log: "🍴 View Menu pressed for: [nombre restaurante]"
3. Debe navegar a /restaurant-dishes
4. Debe mostrar platos del restaurante seleccionado
```

## 🐛 Si Siguen los Problemas

### Verificar Versión de React Native
```bash
npx react-native info
```

### Verificar NativeWind
```bash
cat nativewind.config.js
cat tailwind.config.js
```

### Reiniciar Cache
```bash
# Para el metro del proyecto
rm -rf node_modules/.cache
npx expo start --clear

# O reiniciar completamente
npx expo install --fix
```

### Verificar Logs
```
1. Abrir la consola del Metro bundler
2. Buscar logs de debug: 🍽️ y 🍴
3. Verificar si hay errores de renderizado
4. Verificar warnings de StyleSheet
```

## 📋 Estructura Actual de Botones

```tsx
<View style={{
  flexDirection: 'row',
  gap: 8,
  marginTop: 8
}}>
  {/* Botón Details */}
  <TouchableOpacity style={{
    flex: 1,
    backgroundColor: '#f3f4f6', // GRIS
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Ionicons name="information-circle-outline" size={16} color="#374151" />
    <Text style={{ color: '#374151', fontWeight: '500', fontSize: 14, marginLeft: 4 }}>
      Details
    </Text>
  </TouchableOpacity>
  
  {/* Botón View Menu */}
  <TouchableOpacity style={{
    flex: 1,
    backgroundColor: '#EF4444', // ROJO
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Ionicons name="restaurant" size={16} color="white" />
    <Text style={{ color: 'white', fontWeight: '500', fontSize: 14, marginLeft: 4 }}>
      View Menu
    </Text>
  </TouchableOpacity>
</View>
```

## 🎯 Color Esperado
- **Hex**: `#EF4444`
- **RGB**: `rgb(239, 68, 68)`
- **Nombre**: Red-500 (equivalente a Tailwind)

## 📞 Si Nada Funciona

1. **Verificar que la app se haya reiniciado** después de los cambios
2. **Probar la pantalla `/test-buttons`** primero
3. **Verificar logs de consola** para errores
4. **Tomar screenshot** de lo que se ve vs lo que debería verse