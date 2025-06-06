import { Recipe, RecipePreferences } from '../lib/types';
import { geminiService } from './geminiService';

export interface SuggestRecipesInput {
  ingredients: string[];
  preferences: RecipePreferences;
}

export interface SuggestRecipesOutput {
  recipes: Recipe[];
}

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  try {
    const recipes = await geminiService.generateRecipes({
      ingredients: input.ingredients,
      dietaryPreferences: input.preferences.dietaryRestrictions,
      cuisineType: input.preferences.cuisineType,
      difficulty: input.preferences.difficulty,
      servings: input.preferences.servings,
    });

    return { recipes };
  } catch (error) {
    console.error('Failed to generate recipes:', error);
    throw error;
  }
}

export async function identifyIngredients(text: string): Promise<string[]> {
  try {
    return await geminiService.identifyIngredientsFromText(text);
  } catch (error) {
    console.error('Failed to identify ingredients:', error);
    return [];
  }
}