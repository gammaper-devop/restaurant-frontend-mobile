import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          🍽️ Restaurant App
        </Text>
        <Text style={styles.subtitle}>
          Encuentra restaurantes cercanos usando tu ubicación
        </Text>
        
        <Link href="/restaurants-native" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>
              🍽️ Ver Restaurantes
            </Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/test-geolocation-simple" asChild>
          <TouchableOpacity style={styles.buttonSecondary}>
            <Text style={styles.buttonSecondaryText}>
              🧪 Probar Geolocalización
            </Text>
          </TouchableOpacity>
        </Link>
        
        <Text style={styles.description}>
          Presiona el botón para probar el sistema de ubicación
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonSecondary: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonSecondaryText: {
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
