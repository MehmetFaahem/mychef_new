import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";

export function Timer() {
  const [initialMinutes, setInitialMinutes] = useState(5);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const successColor = useThemeColor({}, "success");
  const errorColor = useThemeColor({}, "error");
  const borderColor = useThemeColor({}, "border");
  const backgroundSecondaryColor = useThemeColor({}, "backgroundSecondary");

  // Create styles with theme colors
  const styles = createStyles({
    background: backgroundColor,
    backgroundSecondary: backgroundSecondaryColor,
    text: textColor,
    textSecondary: textSecondaryColor,
    primary: primaryColor,
    success: successColor,
    error: errorColor,
    border: borderColor,
  });

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && isRunning) {
        setIsRunning(false);
        Alert.alert("Timer Finished!", "Your cooking timer has reached zero.", [
          { text: "OK", style: "default" },
        ]);
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft]);

  const handleStartPause = () => {
    if (timeLeft <= 0 && !isRunning) {
      // If timer ended and user presses start again, reset to initial time
      setTimeLeft(initialMinutes * 60 + initialSeconds);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialMinutes * 60 + initialSeconds);
  };

  const handleSetTime = () => {
    const newTotalSeconds = initialMinutes * 60 + initialSeconds;
    setTimeLeft(newTotalSeconds);
    if (isRunning) {
      setIsRunning(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleMinutesChange = (text: string) => {
    const value = parseInt(text, 10);
    setInitialMinutes(isNaN(value) ? 0 : Math.max(0, value));
  };

  const handleSecondsChange = (text: string) => {
    const value = parseInt(text, 10);
    setInitialSeconds(isNaN(value) ? 0 : Math.max(0, Math.min(59, value)));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="timer" size={20} color={primaryColor} />
        <Text style={styles.title}>Cooking Timer</Text>
      </View>

      {/* Time Inputs */}
      <View style={styles.inputContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Minutes</Text>
          <TextInput
            style={[styles.input, isRunning && styles.inputDisabled]}
            value={String(initialMinutes)}
            onChangeText={handleMinutesChange}
            keyboardType="numeric"
            editable={!isRunning}
            selectTextOnFocus
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Seconds</Text>
          <TextInput
            style={[styles.input, isRunning && styles.inputDisabled]}
            value={String(initialSeconds)}
            onChangeText={handleSecondsChange}
            keyboardType="numeric"
            editable={!isRunning}
            selectTextOnFocus
          />
        </View>
      </View>

      {/* Set Time Button */}
      <TouchableOpacity
        style={[styles.setButton, isRunning && styles.buttonDisabled]}
        onPress={handleSetTime}
        disabled={isRunning}
      >
        <Text
          style={[styles.setButtonText, isRunning && styles.buttonTextDisabled]}
        >
          Set Time
        </Text>
      </TouchableOpacity>

      {/* Timer Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.timeDisplay}>{formatTime(timeLeft)}</Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            isRunning ? styles.pauseButton : styles.startButton,
          ]}
          onPress={handleStartPause}
        >
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.controlButtonText}>
            {isRunning ? "Pause" : "Start"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={20} color={textSecondaryColor} />
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 8,
    },
    inputContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      gap: 12,
    },
    inputGroup: {
      flex: 1,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
      marginBottom: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 16,
      textAlign: "center",
      backgroundColor: colors.background,
      color: colors.text,
    },
    inputDisabled: {
      backgroundColor: colors.backgroundSecondary,
      color: colors.textSecondary,
    },
    setButton: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 20,
    },
    setButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
    buttonDisabled: {
      backgroundColor: colors.textSecondary,
    },
    buttonTextDisabled: {
      color: colors.textSecondary,
    },
    displayContainer: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      paddingVertical: 20,
      paddingHorizontal: 16,
      marginBottom: 20,
      alignItems: "center",
    },
    timeDisplay: {
      fontSize: 36,
      fontWeight: "700",
      color: colors.text,
      fontFamily: "monospace",
    },
    controlsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    controlButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    startButton: {
      backgroundColor: colors.success,
    },
    pauseButton: {
      backgroundColor: colors.error,
    },
    controlButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 6,
    },
    resetButton: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    resetButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 6,
    },
  });
