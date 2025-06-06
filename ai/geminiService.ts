import { Recipe, RecipeStep } from '../lib/types';

const GEMINI_API_KEY = 'AIzaSyB-jknLQyovqkYLFYHdV9RvnmNU9Gurb70'; // Replace with actual API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GenerateRecipesInput {
  ingredients: string[];
  dietaryPreferences?: string;
  cuisineType?: string;
  difficulty?: string;
  servings?: number;
}

export class GeminiService {
  private buildRecipePrompt({
    ingredients,
    dietaryPreferences = '',
    cuisineType = '',
    difficulty = '',
    servings = 4,
  }: GenerateRecipesInput): string {
    return `
    You are a world-class chef and recipe expert. Create 3 diverse and delicious recipes using these ingredients: ${ingredients.join(', ')}.

    Requirements:
    - Use ONLY the provided ingredients (you can suggest optional common pantry items)
    - Servings: ${servings} people
    ${dietaryPreferences ? `- Dietary preferences: ${dietaryPreferences}` : ''}
    ${cuisineType ? `- Cuisine type: ${cuisineType}` : ''}
    ${difficulty ? `- Difficulty level: ${difficulty}` : ''}

    Return in this EXACT JSON format:
    {
      "recipes": [
        {
          "name": "Recipe Name",
          "ingredients": ["ingredient 1", "ingredient 2"],
          "steps": [
            {
              "description": "Detailed step description",
              "duration": 5,
              "tips": ["helpful tip"],
              "temperature": "180°C"
            }
          ],
          "prepTime": 15,
          "cookTime": 30,
          "difficulty": "Easy",
          "tags": ["tag1", "tag2"]
        }
      ]
    }

    Make the recipes creative, detailed, and practical. Include cooking times, temperatures, and helpful tips.
    `;
  }

  private parseRecipeResponse(response: string): Recipe[] {
    try {
      // Clean up the response text
      const cleanResponse = response.trim();

      // Find JSON boundaries
      const start = cleanResponse.indexOf('{');
      const end = cleanResponse.lastIndexOf('}') + 1;

      if (start === -1 || end <= start) {
        throw new Error('No valid JSON found in response');
      }

      const jsonString = cleanResponse.substring(start, end);
      const jsonData = JSON.parse(jsonString);

      const recipesJson = jsonData.recipes;
      if (!recipesJson || !Array.isArray(recipesJson) || recipesJson.length === 0) {
        throw new Error('No recipes found in response');
      }

      return recipesJson.map((recipeJson: any) => {
        const steps: RecipeStep[] = (recipeJson.steps || []).map((stepJson: any) => ({
          description: stepJson.description || '',
          duration: stepJson.duration ? parseInt(stepJson.duration) : undefined,
          tips: Array.isArray(stepJson.tips) ? stepJson.tips : [],
          temperature: stepJson.temperature,
        }));

        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: recipeJson.name || 'Untitled Recipe',
          ingredients: Array.isArray(recipeJson.ingredients) ? recipeJson.ingredients : [],
          steps,
          prepTime: recipeJson.prepTime ? parseInt(recipeJson.prepTime) : undefined,
          cookTime: recipeJson.cookTime ? parseInt(recipeJson.cookTime) : undefined,
          difficulty: recipeJson.difficulty,
          tags: Array.isArray(recipeJson.tags) ? recipeJson.tags : [],
          isSaved: false,
          isFavorite: false,
          createdAt: new Date(),
        };
      });
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error(`Failed to parse AI response: ${e}`);
    }
  }

  async generateRecipes(input: GenerateRecipesInput): Promise<Recipe[]> {
    try {
      const prompt = this.buildRecipePrompt(input);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Empty response from AI service');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      
      if (!responseText) {
        throw new Error('Empty response text from AI service');
      }

      return this.parseRecipeResponse(responseText);
    } catch (e) {
      console.error('Failed to generate recipes:', e);
      throw new Error(`Failed to generate recipes: ${e}`);
    }
  }

  async identifyIngredientsFromText(text: string): Promise<string[]> {
    try {
      const prompt = `
      Extract food ingredients from this text and return them as a JSON array of strings.
      Only include actual food ingredients, not cooking tools or methods.
      Text: "${text}"
      
      Return format: {"ingredients": ["ingredient1", "ingredient2", ...]}
      `;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 500,
          }
        }),
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        return [];
      }

      const responseText = data.candidates[0].content.parts[0].text;
      const jsonData = JSON.parse(responseText);
      
      return Array.isArray(jsonData.ingredients) ? jsonData.ingredients : [];
    } catch (e) {
      console.error('Failed to identify ingredients:', e);
      return [];
    }
  }
}

export const geminiService = new GeminiService(); 