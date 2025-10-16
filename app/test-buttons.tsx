import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function TestButtonsScreen() {
  const router = useRouter();

  const handleMenuPress = () => {
    console.log('🍴 Menu button pressed!');
  };

  const handleDetailsPress = () => {
    console.log('ℹ️ Details button pressed!');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-gray-50 p-6">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mb-6"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Button Test Screen
        </Text>

        {/* Test Card */}
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Test Restaurant
          </Text>

          {/* Action Buttons using same structure */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              onPress={handleDetailsPress}
              className="flex-1 bg-gray-100 py-2.5 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="information-circle-outline" size={16} color="#374151" />
              <Text className="text-gray-700 font-medium ml-1 text-sm">Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleMenuPress}
              className="flex-1 py-2.5 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: '#EF4444' }}
            >
              <Ionicons name="restaurant" size={16} color="white" />
              <Text className="text-white font-medium ml-1 text-sm">View Menu</Text>
            </TouchableOpacity>
          </View>

          {/* Alternative with different styles */}
          <Text className="text-sm text-gray-600 mt-6 mb-2">Alternative Styles:</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              onPress={handleDetailsPress}
              style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                paddingVertical: 10,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="information-circle-outline" size={16} color="#374151" />
              <Text style={{ color: '#374151', fontWeight: '500', fontSize: 14, marginLeft: 4 }}>
                Details
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleMenuPress}
              style={{
                flex: 1,
                backgroundColor: '#EF4444',
                paddingVertical: 10,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="restaurant" size={16} color="white" />
              <Text style={{ color: 'white', fontWeight: '500', fontSize: 14, marginLeft: 4 }}>
                View Menu
              </Text>
            </TouchableOpacity>
          </View>

          {/* Debug info */}
          <View className="mt-6 p-3 bg-gray-50 rounded-lg">
            <Text className="text-xs text-gray-600">
              Check console for button press logs
            </Text>
            <Text className="text-xs text-gray-600 mt-1">
              Red color: #EF4444
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}