import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Alert,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../lib/types';

const { width: screenWidth } = Dimensions.get('window');

export default function RecipeDetailsPage() {
  const { recipe: recipeParam } = useLocalSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const progressAnim = new Animated.Value(0);
  
  let recipe: Recipe | null = null;
  
  try {
    if (typeof recipeParam === 'string') {
      recipe = JSON.parse(recipeParam);
    }
  } catch (error) {
    console.error('Failed to parse recipe:', error);
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#E74C3C" />
          <Text style={styles.errorTitle}>Recipe Not Found</Text>
          <Text style={styles.errorText}>
            Unable to load recipe details. Please go back and try again.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const instructionSteps = recipe.steps || [];
  const totalSteps = instructionSteps.length;
  const currentStepData = instructionSteps[currentStep];

  // Timer effect
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && isTimerRunning) {
        setIsTimerRunning(false);
        setIsTimerPaused(false);
        Alert.alert(
          '⏰ Step Complete!',
          `Step ${currentStep + 1} timer finished. Ready for the next step?`,
          [
            { text: 'Continue', style: 'default' },
            { 
              text: 'Next Step', 
              style: 'default',
              onPress: handleNextStep
            }
          ]
        );
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimerRunning, timeLeft]);

  // Progress animation
  useEffect(() => {
    const progress = totalSteps > 0 ? (currentStep + 1) / totalSteps : 0;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const startTimer = (duration: number = 300) => { // Default 5 minutes
    setTimeLeft(duration);
    setIsTimerRunning(true);
    setIsTimerPaused(false);
  };

  const pauseTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setIsTimerPaused(true);
    } else if (isTimerPaused) {
      setIsTimerRunning(true);
      setIsTimerPaused(false);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setIsTimerPaused(false);
    setTimeLeft(0);
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      resetTimer();
      // Auto-start timer if the step has a duration
      if (currentStepData?.duration) {
        startTimer(currentStepData.duration * 60);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      resetTimer();
    }
  };

  const skipStep = () => {
    resetTimer();
    handleNextStep();
  };

  const getTimerStatus = () => {
    if (isTimerRunning) return 'Running';
    if (isTimerPaused) return 'Paused';
    return 'Stopped';
  };

  const getStepDuration = () => {
    return currentStepData?.duration ? currentStepData.duration * 60 : 300; // Default 5 minutes
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeIcon} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Recipe Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.name}
        </Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.stepIndicator}>Step {currentStep + 1} of {totalSteps}</Text>
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]} 
          />
        </View>
      </View>

      {/* Step Content */}
      <View style={styles.stepContainer}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Step {currentStep + 1}</Text>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionText}>
            {currentStepData?.description || 'No instructions available for this step.'}
          </Text>

          {/* Tips Section */}
          {currentStepData?.tips && currentStepData.tips.length > 0 && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Tips:</Text>
              {currentStepData.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="ellipse" size={6} color="#FF8A00" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Timer Section */}
        <View style={styles.timerSection}>
          <Text style={styles.timerTitle}>Timer</Text>
          
          <View style={styles.circularTimerContainer}>
            <View style={styles.circularTimer}>
              <Text style={styles.timerDisplay}>{formatTime(timeLeft)}</Text>
              <Text style={styles.timerStatus}>{getTimerStatus()}</Text>
            </View>
          </View>

          {/* Timer Controls */}
          <View style={styles.timerControls}>
            <TouchableOpacity style={styles.timerControlButton} onPress={resetTimer}>
              <Ionicons name="refresh" size={20} color="#666" />
              <Text style={styles.timerControlText}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryTimerButton, isTimerRunning && styles.pauseButton]} 
              onPress={() => {
                if (!isTimerRunning && !isTimerPaused && timeLeft === 0) {
                  startTimer(getStepDuration());
                } else {
                  pauseTimer();
                }
              }}
            >
              <Ionicons 
                name={isTimerRunning ? 'pause' : 'play'} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.primaryTimerButtonText}>
                {isTimerRunning ? 'Pause' : (isTimerPaused ? 'Resume' : 'Start')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.timerControlButton} onPress={skipStep}>
              <Ionicons name="play-forward" size={20} color="#666" />
              <Text style={styles.timerControlText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.previousButton} onPress={handlePreviousStep}>
            <Ionicons name="arrow-back" size={20} color="#FF8A00" />
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.previousButtonPlaceholder} />
        )}
        
        <TouchableOpacity 
          style={[
            styles.nextButton,
            currentStep === totalSteps - 1 && styles.finishButton
          ]} 
          onPress={() => {
            if (currentStep === totalSteps - 1) {
              router.back();
            } else {
              handleNextStep();
            }
          }}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps - 1 ? 'Finish Recipe' : 'Next Step'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  stepIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF8A00',
    borderRadius: 3,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepBadge: {
    backgroundColor: '#FF8A00',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 16,
  },
  tipsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  timerSection: {
    marginBottom: 20,
  },
  timerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  circularTimerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  circularTimer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  timerDisplay: {
    fontSize: 32,
    fontWeight: '700',
    color: '#27AE60',
    fontFamily: 'monospace',
  },
  timerStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timerControlButton: {
    alignItems: 'center',
    padding: 10,
  },
  timerControlText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  primaryTimerButton: {
    backgroundColor: '#FF8A00',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  pauseButton: {
    backgroundColor: '#FF8A00',
  },
  primaryTimerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  previousButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF8A00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'center',
  },
  previousButtonPlaceholder: {
    minWidth: 120,
  },
  previousButtonText: {
    color: '#FF8A00',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#FF8A00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'center',
  },
  finishButton: {
    backgroundColor: '#27AE60',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E74C3C',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 