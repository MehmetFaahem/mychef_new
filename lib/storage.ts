import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from './types';

const SAVED_RECIPES_KEY = '@mychef:saved_recipes';
const RECENT_INGREDIENTS_KEY = '@mychef:recent_ingredients';
const RECIPE_PREFERENCES_KEY = '@mychef:recipe_preferences';

export class StorageService {
  // Saved Recipes
  async getSavedRecipes(): Promise<Recipe[]> {
    try {
      const savedRecipes = await AsyncStorage.getItem(SAVED_RECIPES_KEY);
      return savedRecipes ? JSON.parse(savedRecipes) : [];
    } catch (error) {
      console.error('Failed to load saved recipes:', error);
      return [];
    }
  }

  async saveRecipe(recipe: Recipe): Promise<void> {
    try {
      const savedRecipes = await this.getSavedRecipes();
      const updatedRecipe = { ...recipe, isSaved: true };
      const existingIndex = savedRecipes.findIndex(r => r.id === recipe.id);
      
      if (existingIndex >= 0) {
        savedRecipes[existingIndex] = updatedRecipe;
      } else {
        savedRecipes.push(updatedRecipe);
      }
      
      await AsyncStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
    } catch (error) {
      console.error('Failed to save recipe:', error);
      throw error;
    }
  }

  async unsaveRecipe(recipeId: string): Promise<void> {
    try {
      const savedRecipes = await this.getSavedRecipes();
      const filteredRecipes = savedRecipes.filter(r => r.id !== recipeId);
      await AsyncStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(filteredRecipes));
    } catch (error) {
      console.error('Failed to unsave recipe:', error);
      throw error;
    }
  }

  async toggleFavorite(recipe: Recipe): Promise<void> {
    try {
      const savedRecipes = await this.getSavedRecipes();
      const existingIndex = savedRecipes.findIndex(r => r.id === recipe.id);
      
      if (existingIndex >= 0) {
        savedRecipes[existingIndex].isFavorite = !savedRecipes[existingIndex].isFavorite;
        await AsyncStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(savedRecipes));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }

  async isRecipeSaved(recipeId: string): Promise<boolean> {
    try {
      const savedRecipes = await this.getSavedRecipes();
      return savedRecipes.some(r => r.id === recipeId);
    } catch (error) {
      console.error('Failed to check if recipe is saved:', error);
      return false;
    }
  }

  // Recent Ingredients
  async getRecentIngredients(): Promise<string[]> {
    try {
      const recentIngredients = await AsyncStorage.getItem(RECENT_INGREDIENTS_KEY);
      return recentIngredients ? JSON.parse(recentIngredients) : [];
    } catch (error) {
      console.error('Failed to load recent ingredients:', error);
      return [];
    }
  }

  async addRecentIngredient(ingredient: string): Promise<void> {
    try {
      const recentIngredients = await this.getRecentIngredients();
      const normalizedIngredient = ingredient.toLowerCase().trim();
      
      // Remove if already exists
      const filteredIngredients = recentIngredients.filter(
        ing => ing.toLowerCase() !== normalizedIngredient
      );
      
      // Add to beginning
      const updatedIngredients = [ingredient, ...filteredIngredients].slice(0, 20); // Keep only 20 recent
      
      await AsyncStorage.setItem(RECENT_INGREDIENTS_KEY, JSON.stringify(updatedIngredients));
    } catch (error) {
      console.error('Failed to add recent ingredient:', error);
    }
  }

  async addRecentIngredients(ingredients: string[]): Promise<void> {
    for (const ingredient of ingredients) {
      await this.addRecentIngredient(ingredient);
    }
  }

  // Recipe Preferences
  async getRecipePreferences(): Promise<any> {
    try {
      const preferences = await AsyncStorage.getItem(RECIPE_PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : {
        dietaryRestrictions: '',
        cuisineType: '',
        difficulty: '',
        servings: 4,
      };
    } catch (error) {
      console.error('Failed to load recipe preferences:', error);
      return {
        dietaryRestrictions: '',
        cuisineType: '',
        difficulty: '',
        servings: 4,
      };
    }
  }

  async saveRecipePreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem(RECIPE_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save recipe preferences:', error);
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        SAVED_RECIPES_KEY,
        RECENT_INGREDIENTS_KEY,
        RECIPE_PREFERENCES_KEY,
      ]);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
}

export const storageService = new StorageService(); 