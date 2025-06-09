import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface ThemedAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  icon?: keyof typeof Ionicons.glyphMap;
  type?: "default" | "success" | "error" | "warning" | "info";
  onClose: () => void;
}

const { width } = Dimensions.get("window");

export function ThemedAlert({
  visible,
  title,
  message,
  buttons = [{ text: "OK", style: "default" }],
  icon,
  type = "default",
  onClose,
}: ThemedAlertProps) {
  // Theme colors
  const surfaceColor = useThemeColor({}, "surface");
  const primaryColor = useThemeColor({}, "primary");
  const secondaryColor = useThemeColor({}, "secondary");
  const textColor = useThemeColor({}, "text");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const successColor = useThemeColor({}, "success");
  const errorColor = useThemeColor({}, "error");
  const warningColor = useThemeColor({}, "warning");
  const infoColor = useThemeColor({}, "info");
  const borderColor = useThemeColor({}, "border");

  // Create dynamic styles with theme colors
  const styles = createStyles({
    surface: surfaceColor,
    primary: primaryColor,
    secondary: secondaryColor,
    text: textColor,
    textSecondary: textSecondaryColor,
    success: successColor,
    error: errorColor,
    warning: warningColor,
    info: infoColor,
    border: borderColor,
  });

  const getIconAndColor = () => {
    if (icon) {
      return { icon, color: primaryColor };
    }

    switch (type) {
      case "success":
        return { icon: "checkmark-circle" as const, color: successColor };
      case "error":
        return { icon: "alert-circle" as const, color: errorColor };
      case "warning":
        return { icon: "warning" as const, color: warningColor };
      case "info":
        return { icon: "information-circle" as const, color: infoColor };
      default:
        return { icon: "help-circle" as const, color: primaryColor };
    }
  };

  const { icon: alertIcon, color: iconColor } = getIconAndColor();

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  const getButtonStyle = (buttonStyle: string) => {
    switch (buttonStyle) {
      case "destructive":
        return { backgroundColor: errorColor };
      case "cancel":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: borderColor,
        };
      default:
        return { backgroundColor: primaryColor };
    }
  };

  const getButtonTextColor = (buttonStyle: string) => {
    switch (buttonStyle) {
      case "cancel":
        return textColor;
      default:
        return "#FFFFFF";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.alert}>
            <LinearGradient
              colors={[surfaceColor, `${surfaceColor}F5`]}
              style={styles.alertGradient}
            >
              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${iconColor}20` },
                ]}
              >
                <Ionicons name={alertIcon} size={32} color={iconColor} />
              </View>

              {/* Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Message */}
              {message && <Text style={styles.message}>{message}</Text>}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      getButtonStyle(button.style || "default"),
                      buttons.length === 1 && styles.singleButton,
                      index === 0 && buttons.length > 1 && styles.firstButton,
                      index === buttons.length - 1 &&
                        buttons.length > 1 &&
                        styles.lastButton,
                    ]}
                    onPress={() => handleButtonPress(button)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: getButtonTextColor(button.style || "default"),
                        },
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    alertContainer: {
      width: width - 60,
      maxWidth: 320,
    },
    alert: {
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 20,
      },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 25,
    },
    alertGradient: {
      padding: 32,
      alignItems: "center",
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 12,
      lineHeight: 26,
    },
    message: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 28,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    singleButton: {
      marginHorizontal: 20,
    },
    firstButton: {
      marginRight: 6,
    },
    lastButton: {
      marginLeft: 6,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: 0.5,
    },
  });
