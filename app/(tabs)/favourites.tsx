import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RecipeCard } from "../../components/RecipeCard";
import { Toast } from "../../components/Toast";
import { useThemeColor } from "../../hooks/useThemeColor";
import { storageService } from "../../lib/storage";
import { ThemedAlertAPI } from "../../lib/themedAlert";
import { Recipe } from "../../lib/types";

const { width } = Dimensions.get("window");

export default function FavouritesScreen() {
  const router = useRouter();
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [favouriteRecipes, setFavouriteRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );

  // Use consistent theme colors
  const primaryColor = useThemeColor({}, "primary");
  const secondaryColor = useThemeColor({}, "secondary");
  const backgroundColor = useThemeColor({}, "backgroundSecondary");
  const surfaceColor = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const textSecondaryColor = useThemeColor({}, "textSecondary");
  const borderColor = useThemeColor({}, "border");

  // Create styles with theme colors
  const styles = createStyles({
    backgroundSecondary: backgroundColor,
    surface: surfaceColor,
    primary: primaryColor,
    secondary: secondaryColor,
    text: textColor,
    textSecondary: textSecondaryColor,
    border: borderColor,
  });

  const loadFavouriteRecipes = async () => {
    try {
      const recipes = await storageService.getSavedRecipes();
      const favorites = recipes.filter((recipe) => recipe.isFavorite);
      setSavedRecipes(recipes);
      setFavouriteRecipes(favorites);
      setFilteredRecipes(favorites);
    } catch (error) {
      console.error("Failed to load favourite recipes:", error);
      showToast("Failed to load favourite recipes", "error");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavouriteRecipes();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadFavouriteRecipes();
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterRecipes(query);
  };

  const filterRecipes = (query: string) => {
    let filtered = favouriteRecipes;

    if (query.trim()) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query.toLowerCase()) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(query.toLowerCase())
          ) ||
          recipe.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase())
          )
      );
    }

    setFilteredRecipes(filtered);
  };

  const handleRecipePress = (recipe: Recipe) => {
    router.push({
      pathname: "/recipe-details",
      params: { recipe: JSON.stringify(recipe) },
    });
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    const recipeToDelete = favouriteRecipes.find(
      (recipe) => recipe.id === recipeId
    );
    const recipeName = recipeToDelete?.name || "this recipe";

    ThemedAlertAPI.destructive(
      "🗑️ Remove Recipe",
      `Are you sure you want to remove "${recipeName}" from your saved recipes?`,
      async () => {
        try {
          // First update the UI optimistically
          setFavouriteRecipes((prevRecipes) =>
            prevRecipes.filter((recipe) => recipe.id !== recipeId)
          );
          setFilteredRecipes((prevRecipes) =>
            prevRecipes.filter((recipe) => recipe.id !== recipeId)
          );

          // Then perform the actual deletion
          await storageService.unsaveRecipe(recipeId);

          // Show success toast
          showToast(`"${recipeName}" removed successfully!`, "success");
        } catch (error) {
          console.error("Failed to delete recipe:", error);

          // Revert the optimistic update if deletion failed
          await loadFavouriteRecipes();

          showToast("Failed to remove recipe. Please try again.", "error");
        }
      },
      undefined,
      "Remove",
      "Cancel"
    );
  };

  const handleToggleFavorite = async (recipe: Recipe) => {
    try {
      // Optimistically update the UI first
      const updatedSavedRecipes = savedRecipes.map((r) =>
        r.id === recipe.id ? { ...r, isFavorite: !r.isFavorite } : r
      );
      setSavedRecipes(updatedSavedRecipes);

      // Update favorite recipes list
      const updatedFavorites = updatedSavedRecipes.filter((r) => r.isFavorite);
      setFavouriteRecipes(updatedFavorites);

      // Update filtered recipes as well
      const updatedFilteredRecipes = filteredRecipes
        .map((r) =>
          r.id === recipe.id ? { ...r, isFavorite: !r.isFavorite } : r
        )
        .filter((r) => r.isFavorite);
      setFilteredRecipes(updatedFilteredRecipes);

      // Then perform the actual toggle
      await storageService.toggleFavorite(recipe);

      // If the recipe was unfavorited, show a message
      if (recipe.isFavorite) {
        showToast(`"${recipe.name}" removed from favourites`, "info");
      }
    } catch (error) {
      // Revert the optimistic update if toggle failed
      await loadFavouriteRecipes();
      showToast("Failed to update favorite status. Please try again.", "error");
    }
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={80} color={textSecondaryColor} />
      <Text style={styles.emptyTitle}>No Favourite Recipes</Text>
      <Text style={styles.emptySubtitle}>
        Save recipes and mark them as favorites to see them here
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push("/(tabs)")}
      >
        <Text style={styles.emptyButtonText}>Generate Recipes</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[primaryColor, secondaryColor]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Favourite Recipes</Text>
          <Text style={styles.headerSubtitle}>
            {favouriteRecipes.length} favourite
            {favouriteRecipes.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </LinearGradient>

      {favouriteRecipes.length > 0 && (
        <View style={styles.controls}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={textSecondaryColor}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search favourite recipes..."
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={textSecondaryColor}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading favourite recipes...</Text>
          </View>
        ) : filteredRecipes.length === 0 ? (
          favouriteRecipes.length === 0 ? (
            <EmptyState />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={60}
                color={textSecondaryColor}
              />
              <Text style={styles.emptyTitle}>No Results Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search
              </Text>
            </View>
          )
        ) : (
          <View style={styles.recipesContainer}>
            {filteredRecipes.map((recipe, index) => (
              <View key={recipe.id} style={styles.recipeWrapper}>
                <RecipeCard
                  recipe={recipe}
                  onPress={() => handleRecipePress(recipe)}
                  onSave={() => {}} // Already saved
                  onFavorite={() => handleToggleFavorite(recipe)}
                  showSaveButton={false}
                  showDeleteButton={true}
                  onDelete={() => handleDeleteRecipe(recipe.id)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

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
    header: {
      paddingTop: 20,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    headerContent: {
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.9)",
    },
    controls: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 80,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginTop: 20,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 30,
    },
    emptyButton: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
    },
    emptyButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    recipesContainer: {
      padding: 20,
      paddingBottom: 100, // Space for tab bar
    },
    recipeWrapper: {
      marginBottom: 16,
    },
  });
