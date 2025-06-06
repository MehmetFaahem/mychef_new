# MyChef - Mobile Recipe App

A React Native mobile app built with Expo that helps you discover recipes based on your available ingredients.

## Features

### 🏠 Home Screen (Recipe Suggestions)
- **Text Input**: Enter ingredients you have available (comma-separated)
- **Image Input**: Placeholder for future image recognition feature
- **Dietary Preferences**: Optional dietary restrictions or preferences
- **AI Recipe Suggestions**: Get personalized recipe suggestions based on your inputs
- **Recipe Cards**: View suggested recipes with images and ingredient previews

### 📚 Recipes Screen
- **Popular Recipes**: Browse curated popular recipes
- **Recipe Details**: Tap any recipe to view full ingredients and instructions
- **Cooking Tips**: Helpful tips for better cooking

### 🧑‍🍳 Recipe Details
- **Full Recipe View**: Complete ingredients list and step-by-step instructions
- **Cooking Timer**: Built-in timer to help with cooking timing
- **Beautiful UI**: Clean, easy-to-read recipe format

## Technology Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe JavaScript
- **Expo Router**: File-based navigation
- **Ionicons**: Beautiful icons
- **Mock AI Service**: Recipe suggestion engine (easily replaceable with real AI)

## Installation

1. **Clone the repository**
   ```bash
   cd mychef
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - **iOS**: Press `i` in terminal or scan QR code with Camera app
   - **Android**: Press `a` in terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in terminal

## Usage

### Getting Recipe Suggestions

1. **Enter Ingredients**: On the Home screen, tap "Text Input" tab and enter your available ingredients
   - Example: "chicken breast, broccoli, soy sauce, rice"

2. **Add Dietary Preferences** (Optional): Enter any dietary restrictions
   - Example: "vegetarian", "gluten-free", "low-carb"

3. **Get Suggestions**: Tap "Suggest Recipes" button

4. **View Results**: Browse suggested recipes and tap any card to see full details

### Exploring Recipes

1. **Browse Popular Recipes**: Switch to "Recipes" tab to see curated popular recipes

2. **View Recipe Details**: Tap any recipe card to see:
   - Full ingredients list
   - Step-by-step cooking instructions
   - Built-in cooking timer

3. **Use Cooking Timer**: In recipe details, tap the timer icon to:
   - Set custom cooking times
   - Start/pause/reset timer
   - Get notifications when time is up

## Customization

### Adding Real AI Integration

The app currently uses a mock recipe suggestion service. To integrate with a real AI service:

1. **Replace the mock service** in `ai/suggestRecipes.ts`
2. **Add your API credentials** to environment variables
3. **Update the suggestion logic** to call your preferred AI service (OpenAI, Google AI, etc.)

### Adding More Recipes

To add more recipes to the popular recipes section:

1. **Edit `app/(tabs)/explore.tsx`**
2. **Add recipes to the `popularRecipes` array**
3. **Follow the existing `Recipe` type structure**

### Customizing UI

- **Colors**: Update color constants in styles
- **Images**: Replace Unsplash URLs with your own images
- **Icons**: Change Ionicons to different icon sets if needed

## File Structure

```
mychef/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home screen (recipe suggestions)
│   │   ├── explore.tsx        # Recipes screen (popular recipes)
│   │   └── _layout.tsx        # Tab navigation setup
│   ├── recipe-details.tsx     # Recipe details screen
│   └── _layout.tsx            # App layout
├── components/
│   ├── RecipeCard.tsx         # Recipe card component
│   └── Timer.tsx              # Cooking timer component
├── lib/
│   └── types.ts               # TypeScript type definitions
└── ai/
    └── suggestRecipes.ts      # Recipe suggestion service
```

## Future Enhancements

- **Image Recognition**: Implement ingredient recognition from photos
- **User Accounts**: Save favorite recipes and preferences
- **Shopping Lists**: Generate shopping lists from recipes
- **Nutritional Information**: Add calorie and nutritional data
- **Recipe Sharing**: Share recipes with friends
- **Voice Instructions**: Audio step-by-step cooking guidance
- **Meal Planning**: Weekly meal planning features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

---

**Happy Cooking! 👨‍🍳👩‍🍳**
