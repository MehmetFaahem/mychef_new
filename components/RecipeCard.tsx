import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Recipe } from '../lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: () => void;
  onPress?: () => void;
  onFavorite?: () => void;
  showSaveButton?: boolean;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

export function RecipeCard({ 
  recipe, 
  onSave, 
  onPress, 
  onFavorite, 
  showSaveButton = true, 
  showDeleteButton = false, 
  onDelete 
}: RecipeCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: '/recipe-details',
        params: { recipe: JSON.stringify(recipe) }
      });
    }
  };

  const getImageUri = () => {
    if (recipe.imageUrl) {
      return recipe.imageUrl;
    }
    
    // Simple placeholder based on recipe name
    if (recipe.name.toLowerCase().includes('salad')) {
      return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop';
    } else if (recipe.name.toLowerCase().includes('chicken')) {
      return 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=250&fit=crop';
    } else if (recipe.name.toLowerCase().includes('pasta')) {
      return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=250&fit=crop';
    } else if (recipe.name.toLowerCase().includes('pancake')) {
      return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=250&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=250&fit=crop';
  };

  const truncateIngredients = (ingredients: string[], maxLength: number = 60) => {
    const ingredientList = ingredients.slice(0, 4).join(', ');
    return ingredientList.length > maxLength 
      ? ingredientList.substring(0, maxLength) + '...' 
      : ingredientList;
  };

  const getTotalTime = () => {
    const prep = recipe.prepTime || 0;
    const cook = recipe.cookTime || 0;
    return prep + cook;
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.imageContainer} onPress={handlePress}>
        <Image 
          source={{ uri: getImageUri() }} 
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(108, 92, 231, 0.8)', 'rgba(255, 107, 157, 0.8)']}
          style={styles.gradient}
        >
          <View style={styles.gradientContent}>
            <Text style={styles.title} numberOfLines={2}>{recipe.name}</Text>
            <View style={styles.timeContainer}>
              {getTotalTime() > 0 && (
                <View style={styles.timeInfo}>
                  <Ionicons name="time" size={14} color="white" />
                  <Text style={styles.timeText}>{getTotalTime()} min</Text>
                </View>
              )}
              {recipe.difficulty && (
                <View style={styles.difficultyInfo}>
                  <Ionicons name="speedometer" size={14} color="white" />
                  <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.buttonContainer}>
            {showSaveButton && onSave && (
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  recipe.isSaved && styles.saveButtonActive
                ]} 
                onPress={onSave}
              >
                <Ionicons 
                  name={recipe.isSaved ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={recipe.isSaved ? "#FF6B35" : "white"}
                />
              </TouchableOpacity>
            )}
            
            {onFavorite && (
              <TouchableOpacity style={styles.favoriteButton} onPress={onFavorite}>
                <Ionicons 
                  name={recipe.isFavorite ? "heart" : "heart-outline"} 
                  size={20} 
                  color="white" 
                />
              </TouchableOpacity>
            )}
            
            {showDeleteButton && onDelete && (
              <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                <Ionicons 
                  name="trash-outline" 
                  size={20} 
                  color="white" 
                />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.ingredients} numberOfLines={2}>
          Ingredients: {truncateIngredients(recipe.ingredients)}
        </Text>
        
        {recipe.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Ionicons name="book" size={16} color="white" />
            <Text style={styles.buttonText}>View Recipe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.stepsButton}>
            <Ionicons name="list" size={16} color="#6C5CE7" />
            <Text style={styles.stepsButtonText}>{recipe.steps.length} steps</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
  },
  gradientContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 24,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  difficultyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  buttonContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 157, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  ingredients: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  tagText: {
    color: '#6C5CE7',
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  stepsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  stepsButtonText: {
    color: '#6C5CE7',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
}); 