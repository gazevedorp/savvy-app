import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export default function AddLinkButton() {
  const { colors } = useTheme();
  const router = useRouter();
  const scale = useSharedValue(1);
  
  const handlePress = () => {
    router.push('/share');
  };
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.buttonContainer, animatedStyle]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56, // Define a largura
    height: 56, // Define a altura (igual à largura para ser um círculo)
    borderRadius: 28, // Metade da largura/altura para ser totalmente redondo
  },
});