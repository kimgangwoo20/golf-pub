// VolumeControl.tsx - 볼륨 컨트롤
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface VolumeControlProps {
  volume: number; // 0-100
  onVolumeChange?: (volume: number) => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange,
}) => {
  const handleDecrease = () => {
    if (volume > 0 && onVolumeChange) {
      onVolumeChange(Math.max(0, volume - 10));
    }
  };

  const handleIncrease = () => {
    if (volume < 100 && onVolumeChange) {
      onVolumeChange(Math.min(100, volume + 10));
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return '🔇';
    if (volume < 50) return '🔉';
    return '🔊';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleDecrease}>
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>
      <View style={styles.volumeInfo}>
        <Text style={styles.icon}>{getVolumeIcon()}</Text>
        <Text style={styles.volumeText}>{volume}%</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleIncrease}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  volumeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 24,
  },
  volumeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
