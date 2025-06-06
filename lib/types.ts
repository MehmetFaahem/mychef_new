export interface RecipeStep {
  description: string;
  duration?: number; // in minutes
  imageUrl?: string;
  tips: string[];
  temperature?: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  steps: RecipeStep[];
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  tags: string[];
  isSaved: boolean;
  isFavorite: boolean;
  createdAt: Date;
}

export interface RecipePreferences {
  dietaryRestrictions: string;
  cuisineType: string;
  difficulty: string;
  servings: number;
}

export interface RecipeState {
  generatedRecipes: Recipe[];
  savedRecipes: Recipe[];
  selectedIngredients: string[];
  recentIngredients: string[];
  isLoading: boolean;
  error?: string;
}