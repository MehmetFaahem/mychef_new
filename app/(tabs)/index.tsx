import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { suggestRecipes, SuggestRecipesInput } from "../../ai/suggestRecipes";
import { RecipeCard } from "../../components/RecipeCard";
import { Toast } from "../../components/Toast";
import { useThemeColor } from "../../hooks/useThemeColor";
import { storageService } from "../../lib/storage";
import { ThemedAlertAPI } from "../../lib/themedAlert";
import { Recipe, RecipePreferences } from "../../lib/types";
// import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [ingredientInput, setIngredientInput] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recentIngredients, setRecentIngredients] = useState<string[]>([]);
  const [servingsInput, setServingsInput] = useState("4");
  const [preferences, setPreferences] = useState<RecipePreferences>({
    dietaryRestrictions: "",
    cuisineType: "",
    difficulty: "",
    servings: 4,
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, "backgroundSecondary");
  const surfaceColor = useThemeColor({}, "surface");
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const borderColor = useThemeColor({}, "border");
  const primaryBackground = useThemeColor({}, "primaryBackground");
  const primaryBorder = useThemeColor({}, "primaryBorder");
  const errorColor = useThemeColor({}, "error");

  // Create styles with theme colors
  const styles = createStyles({
    backgroundSecondary: backgroundColor,
    surface: surfaceColor,
    primary: primaryColor,
    text: textColor,
    textSecondary: textSecondaryColor,
    textInverse: useThemeColor({}, "textInverse"),
    border: borderColor,
    primaryBackground: primaryBackground,
    primaryBorder: primaryBorder,
    error: errorColor,
    errorBackground: useThemeColor({}, "errorBackground"),
  });

  const router = useRouter();

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        const [savedRecipes, recentIngredients, savedPreferences] =
          await Promise.all([
            storageService.getSavedRecipes(),
            storageService.getRecentIngredients(),
            storageService.getRecipePreferences(),
          ]);

        setSavedRecipes(savedRecipes);
        setRecentIngredients(recentIngredients);
        setPreferences(savedPreferences);
        setServingsInput(savedPreferences.servings.toString());
      } catch (error) {
        console.error("Failed to initialize data:", error);
      }
    };

    initializeData();

    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Sync servings input with preferences
  useEffect(() => {
    const numValue = parseInt(servingsInput);
    if (!isNaN(numValue) && numValue >= 1) {
      setPreferences((prev) => ({
        ...prev,
        servings: numValue,
      }));
    }
  }, [servingsInput]);

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim();
    if (trimmed && !selectedIngredients.includes(trimmed)) {
      setSelectedIngredients((prev) => [...prev, trimmed]);
      storageService.addRecentIngredient(trimmed);
    }
    setIngredientInput("");
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) => prev.filter((ing) => ing !== ingredient));
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleSubmit = async () => {
    if (selectedIngredients.length === 0) {
      ThemedAlertAPI.alert(
        "Missing Ingredients",
        "Please add some ingredients to get recipe suggestions.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    setRecipes([]);
    setError(null);

    // Ensure valid serving value
    let validServings = parseInt(servingsInput);
    if (isNaN(validServings) || validServings < 1) {
      validServings = 1;
      setServingsInput("1");
    }

    const finalPreferences = {
      ...preferences,
      servings: validServings,
    };

    const input: SuggestRecipesInput = {
      ingredients: selectedIngredients,
      preferences: finalPreferences,
    };

    try {
      const result = await suggestRecipes(input);
      if (result.recipes && result.recipes.length > 0) {
        // Check if any of the generated recipes are already saved
        const currentSavedRecipes = await storageService.getSavedRecipes();
        const savedRecipeIds = new Set(currentSavedRecipes.map((r) => r.id));

        const recipesWithSavedStatus = result.recipes.map((recipe) => ({
          ...recipe,
          isSaved: savedRecipeIds.has(recipe.id),
        }));

        setRecipes(recipesWithSavedStatus);
        ThemedAlertAPI.success(
          "Recipes Found!",
          `Found ${result.recipes.length} recipe${
            result.recipes.length === 1 ? "" : "s"
          } for you.`,
          [{ text: "Great!" }]
        );

        // Save ingredients to recent
        await storageService.addRecentIngredients(selectedIngredients);

        // Scroll to generated recipes
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 500);
      } else {
        ThemedAlertAPI.info(
          "No Recipes Found",
          "Try different ingredients or check your preferences.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error suggesting recipes:", error);
      setError("Failed to get recipe suggestions. Please try again.");
      ThemedAlertAPI.error(
        "Error",
        "Failed to get recipe suggestions. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecipe = async (recipe: Recipe) => {
    try {
      await storageService.saveRecipe(recipe);

      // Update the recipes state to reflect the saved status
      setRecipes((prevRecipes) =>
        prevRecipes.map((r) =>
          r.id === recipe.id ? { ...r, isSaved: true } : r
        )
      );

      const updatedSavedRecipes = await storageService.getSavedRecipes();
      setSavedRecipes(updatedSavedRecipes);

      // Show a success toast
      showToast(`"${recipe.name}" saved to your collection!`, "success");
    } catch (error) {
      showToast("Failed to save recipe. Please try again.", "error");
    }
  };

  const handleImagePicker = async () => {
    // For demo purposes, show a placeholder message
    ThemedAlertAPI.info(
      "Image Upload",
      "Image recognition feature is coming soon! For now, please use text input to list your ingredients.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <Image
                    source={require("@/assets/images/mychef.png")}
                    style={styles.headerLogoImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>My Chef AI</Text>
                  <Text style={styles.headerSubtitle}>
                    What&apos;s in your kitchen?
                  </Text>
                </View>
              </View>
              {savedRecipes.length > 0 && (
                <TouchableOpacity
                  style={styles.savedButton}
                  onPress={() => router.push("/(tabs)/saved")}
                >
                  <Ionicons name="bookmark" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Welcome Section */}
          <Animated.View
            style={[
              styles.welcomeSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={["rgba(108, 92, 231, 0.1)", "rgba(108, 92, 231, 0.05)"]}
              style={styles.welcomeCard}
            >
              <View style={styles.welcomeHeader}>
                <View style={styles.welcomeIconContainer}>
                  <Image
                    source={require("@/assets/images/mychef.png")}
                    style={styles.welcomeLogoImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.welcomeTextContainer}>
                  <Text style={styles.welcomeTitle}>
                    Add ingredients and let AI create amazing recipes for you
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Input Section */}
          <Animated.View
            style={[
              styles.inputSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.inputCard}>
              <Text style={styles.sectionTitle}>Add Ingredients</Text>
              <Text style={styles.sectionSubtitle}>
                Type ingredients one by one
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., chicken breast, tomatoes..."
                  value={ingredientInput}
                  onChangeText={setIngredientInput}
                  onSubmitEditing={() => addIngredient(ingredientInput)}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => addIngredient(ingredientInput)}
                  disabled={!ingredientInput.trim()}
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {/* Recent Ingredients */}
              {recentIngredients.length > 0 && (
                <View style={styles.recentSection}>
                  <Text style={styles.recentTitle}>Recent Ingredients</Text>
                  <View style={styles.chipContainer}>
                    {recentIngredients.slice(0, 10).map((ingredient, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.recentChip}
                        onPress={() => addIngredient(ingredient)}
                      >
                        <Text style={styles.recentChipText}>{ingredient}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Selected Ingredients */}
              {selectedIngredients.length > 0 && (
                <View style={styles.selectedSection}>
                  <Text style={styles.selectedTitle}>
                    Selected Ingredients ({selectedIngredients.length})
                  </Text>
                  <View style={styles.chipContainer}>
                    {selectedIngredients.map((ingredient, index) => (
                      <View key={index} style={styles.selectedChip}>
                        <Text style={styles.selectedChipText}>
                          {ingredient}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeIngredient(ingredient)}
                        >
                          <Ionicons name="close" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Recipe Preferences */}
              <View style={styles.preferencesSection}>
                <Text style={styles.preferencesTitle}>Recipe Preferences</Text>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>
                    Dietary Restrictions
                  </Text>
                  <TextInput
                    style={styles.preferenceInput}
                    placeholder="e.g., vegetarian, gluten-free"
                    value={preferences.dietaryRestrictions}
                    onChangeText={(text) =>
                      setPreferences((prev) => ({
                        ...prev,
                        dietaryRestrictions: text,
                      }))
                    }
                  />
                </View>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Cuisine Type</Text>
                  <TextInput
                    style={styles.preferenceInput}
                    placeholder="e.g., Italian, Asian, Mexican"
                    value={preferences.cuisineType}
                    onChangeText={(text) =>
                      setPreferences((prev) => ({ ...prev, cuisineType: text }))
                    }
                  />
                </View>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Difficulty</Text>
                  <TextInput
                    style={styles.preferenceInput}
                    placeholder="Easy, Medium, Hard"
                    value={preferences.difficulty}
                    onChangeText={(text) =>
                      setPreferences((prev) => ({ ...prev, difficulty: text }))
                    }
                  />
                </View>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Servings</Text>
                  <TextInput
                    style={styles.preferenceInput}
                    placeholder="start writing your serving"
                    value={servingsInput}
                    onChangeText={setServingsInput}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  isLoading && styles.generateButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isLoading || selectedIngredients.length === 0}
              >
                <LinearGradient
                  colors={["#6C5CE7", "#FF6B9D"]}
                  style={styles.generateButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="sparkles" size={20} color="white" />
                  )}
                  <Text style={styles.generateButtonText}>
                    {isLoading ? "Generating Recipes" : "Generate Recipes"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6C5CE7" />
              <Text style={styles.loadingText}>
                Creating delicious recipes for you...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color={errorColor} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Generated Recipes */}
          {recipes.length > 0 && (
            <Animated.View
              style={[
                styles.recipesSection,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.recipesTitle}>
                Generated Recipes ({recipes.length})
              </Text>
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSave={() => saveRecipe(recipe)}
                />
              ))}
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast
        message={toastMessage}
        type={toastType}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

// Create styles function to access theme colors
const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      backgroundColor: colors.primary,
      paddingTop: 20,
      paddingBottom: 20,
      paddingHorizontal: 24,
    },
    headerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 48,
      height: 48,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    headerLogoImage: {
      width: 32,
      height: 32,
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.textInverse,
      letterSpacing: 0.5,
    },
    headerSubtitle: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.8)",
      marginTop: 2,
    },
    savedButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    welcomeSection: {
      paddingHorizontal: 24,
      paddingTop: 24,
    },
    welcomeCard: {
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.04,
      shadowRadius: 16,
      elevation: 4,
    },
    welcomeHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    welcomeIconContainer: {
      width: 48,
      height: 48,
      backgroundColor: colors.primary,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    welcomeLogoImage: {
      width: 32,
      height: 32,
    },
    welcomeTextContainer: {
      flex: 1,
    },
    welcomeTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
      lineHeight: 22,
    },
    inputSection: {
      paddingHorizontal: 4,
      paddingTop: 2,
    },
    inputCard: {
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 24,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.06,
      shadowRadius: 20,
      elevation: 8,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      fontSize: 16,
      backgroundColor: colors.surface,
      color: colors.text,
      marginRight: 12,
    },
    addButton: {
      width: 48,
      height: 48,
      backgroundColor: colors.primary,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    recentSection: {
      marginBottom: 20,
    },
    recentTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    recentChip: {
      backgroundColor: colors.primaryBackground,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
    },
    recentChipText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "500",
    },
    selectedSection: {
      marginBottom: 20,
    },
    selectedTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
    },
    selectedChip: {
      backgroundColor: colors.primary,
      paddingLeft: 16,
      paddingRight: 8,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
    },
    selectedChipText: {
      color: colors.textInverse,
      fontSize: 14,
      fontWeight: "500",
      marginRight: 8,
    },
    removeButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    preferencesSection: {
      marginBottom: 24,
    },
    preferencesTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    preferenceRow: {
      marginBottom: 16,
    },
    preferenceLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.textSecondary,
      marginBottom: 8,
    },
    preferenceInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    generateButton: {
      borderRadius: 16,
      overflow: "hidden",
    },
    generateButtonDisabled: {
      opacity: 0.7,
    },
    generateButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
    generateButtonText: {
      color: colors.textInverse,
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: 0.5,
      marginLeft: 8,
    },
    loadingContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 16,
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.errorBackground,
      padding: 16,
      marginHorizontal: 24,
      marginTop: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.error,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      marginLeft: 8,
      flex: 1,
    },
    recipesSection: {
      paddingHorizontal: 24,
      paddingTop: 32,
    },
    recipesTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 20,
    },
  });
