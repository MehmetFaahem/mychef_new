/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#6C5CE7';
const tintColorDark = '#A78BFA';

export const Colors = {
  light: {
    // Primary brand colors
    primary: '#6C5CE7',
    primaryDark: '#5B4AC7',
    primaryLight: '#8B7EE8',
    primaryBackground: 'rgba(108, 92, 231, 0.1)',
    primaryBorder: 'rgba(108, 92, 231, 0.2)',
    
    // Secondary/accent colors
    secondary: '#FF6B35',
    secondaryDark: '#E55A2F',
    secondaryLight: '#FF8C66',
    accent: '#F7931E',
    
    // Semantic colors
    success: '#22C55E',
    successBackground: '#F0FDF4',
    error: '#EF4444',
    errorBackground: '#FEF2F2',
    warning: '#F59E0B',
    warningBackground: '#FFFBEB',
    info: '#3B82F6',
    infoBackground: '#EFF6FF',
    
    // Text colors
    text: '#1A202C',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    textInverse: '#FFFFFF',
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    backgroundTertiary: '#F1F5F9',
    
    // Surface colors
    surface: '#FFFFFF',
    surfaceSecondary: '#F8FAFC',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Border colors
    border: '#E2E8F0',
    borderSecondary: '#CBD5E1',
    
    // Gray scale
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    
    // System colors
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    // Primary brand colors
    primary: '#A78BFA',
    primaryDark: '#8B5CF6',
    primaryLight: '#C4B5FD',
    primaryBackground: 'rgba(167, 139, 250, 0.1)',
    primaryBorder: 'rgba(167, 139, 250, 0.2)',
    
    // Secondary/accent colors
    secondary: '#FB7185',
    secondaryDark: '#F43F5E',
    secondaryLight: '#FBBF24',
    accent: '#FBBF24',
    
    // Semantic colors
    success: '#10B981',
    successBackground: '#064E3B',
    error: '#F87171',
    errorBackground: '#7F1D1D',
    warning: '#F59E0B',
    warningBackground: '#78350F',
    info: '#60A5FA',
    infoBackground: '#1E3A8A',
    
    // Text colors
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    textInverse: '#1A202C',
    
    // Background colors
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',
    
    // Surface colors
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    overlay: 'rgba(0, 0, 0, 0.8)',
    
    // Border colors
    border: '#334155',
    borderSecondary: '#475569',
    
    // Gray scale (adjusted for dark mode)
    gray50: '#1F2937',
    gray100: '#374151',
    gray200: '#4B5563',
    gray300: '#6B7280',
    gray400: '#9CA3AF',
    gray500: '#D1D5DB',
    gray600: '#E5E7EB',
    gray700: '#F3F4F6',
    gray800: '#F9FAFB',
    gray900: '#FFFFFF',
    
    // System colors
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
  },
};

// Utility function to get colors with opacity
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Handle rgba colors
  if (color.startsWith('rgba')) {
    return color.replace(/[\d\.]+\)$/g, `${opacity})`);
  }
  
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  return color;
};
