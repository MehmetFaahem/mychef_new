import React from 'react';
import { StyleSheet, TouchableOpacity, Text, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  lightColor?: string;
  darkColor?: string;
};

export function ThemedButton({
  title,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  style,
  lightColor,
  darkColor,
  disabled,
  ...rest
}: ThemedButtonProps) {
  const primaryColor = useThemeColor({ light: lightColor, dark: darkColor }, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const backgroundColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: size === 'small' ? 8 : size === 'large' ? 16 : 12,
      paddingHorizontal: size === 'small' ? 12 : size === 'large' ? 24 : 16,
      paddingVertical: size === 'small' ? 8 : size === 'large' ? 16 : 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled || loading ? 0.6 : 1,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: primaryColor };
      case 'secondary':
        return { ...baseStyle, backgroundColor: secondaryColor };
      case 'outline':
        return { 
          ...baseStyle, 
          backgroundColor: 'transparent', 
          borderWidth: 1, 
          borderColor: primaryColor 
        };
      case 'ghost':
        return { ...baseStyle, backgroundColor: 'transparent' };
      case 'gradient':
        return baseStyle;
      default:
        return { ...baseStyle, backgroundColor: primaryColor };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      fontWeight: '600',
      textAlign: 'center',
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'gradient':
        return { ...baseStyle, color: '#FFFFFF' };
      case 'outline':
        return { ...baseStyle, color: primaryColor };
      case 'ghost':
        return { ...baseStyle, color: primaryColor };
      default:
        return { ...baseStyle, color: '#FFFFFF' };
    }
  };

  const getIconSize = () => {
    return size === 'small' ? 16 : size === 'large' ? 20 : 18;
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'gradient':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return primaryColor;
      default:
        return '#FFFFFF';
    }
  };

  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && (
        <Ionicons 
          name={icon} 
          size={getIconSize()} 
          color={getIconColor()} 
          style={{ marginRight: 8 }} 
        />
      )}
      <Text style={[getTextStyle(), { marginHorizontal: icon ? 4 : 0 }]}>
        {loading ? 'Loading...' : title}
      </Text>
      {icon && iconPosition === 'right' && (
        <Ionicons 
          name={icon} 
          size={getIconSize()} 
          color={getIconColor()} 
          style={{ marginLeft: 8 }} 
        />
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        disabled={disabled || loading}
        {...rest}
      >
        <LinearGradient
          colors={[primaryColor, secondaryColor]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
} 