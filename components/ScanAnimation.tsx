import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface ScanAnimationProps {
  status: 'waiting' | 'success' | 'error';
  size?: number;
}

const ScanAnimation = ({ status, size = 160 }: ScanAnimationProps) => {
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (status === 'waiting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation if status is not 'waiting'
      pulseAnim.stopAnimation();
      
      // If success or error, show a quick animation
      if (status === 'success' || status === 'error') {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
    
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [status, pulseAnim]);

  // Define the scale animation
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });
  
  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  // Define colors based on status
  let mainColor = '#3498db'; // Blue for waiting
  if (status === 'success') {
    mainColor = '#2ecc71'; // Green for success
  } else if (status === 'error') {
    mainColor = '#e74c3c'; // Red for error
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: mainColor,
            transform: [{ scale: pulseScale }],
            opacity: opacity,
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: size * 0.4,
          },
        ]}
      />
      <View
        style={[
          styles.innerCircle,
          {
            backgroundColor: status === 'waiting' ? '#fff' : mainColor,
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScanAnimation;
