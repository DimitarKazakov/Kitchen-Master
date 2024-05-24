export type ClientUser = {
  Id: string;
  username: string;
  email: string;
  elasticIndex: string;
  importedRecipes: string[];
  autoImportEnabled: boolean;
  subscription: 'FREE' | 'PRO';
  favoriteRecipeIDs: string[];
  height: number;
  weight: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  calories: number;
  allergies: string[];
  billing: number;
};

export type Recipe = {
  Id: string;
  name: string;
  description: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  preparationTime: string;
  cookingTime: string;
  allTime: string;
  portions: string;
  notes: string;
};

export type RecipeResponse = {
  total: number;
  recipes: Recipe[];
};

export type RecipeStoreRequest = {
  name: string;
  description: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  preparationTime: string;
  cookingTime: string;
  allTime: string;
  portions: string;
  notes: string;
};

export type Menu = {
  Id: string;
  userId: string;
  event: string;
  recipes: Recipe[];
};

export type MenuStoreRequest = {
  event: string;
  recipes: Recipe[];
};

export type ClientUserStoreRequest = {
  username: string;
  autoImportEnabled: boolean;
  favoriteRecipeIDs: string[];
  height: number;
  weight: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  calories: number;
  allergies: string[];
};

export type DailyPlan = {
  Id: string;
  userId: string;
  day: string;
  breakfast?: MealPlan;
  lunch?: MealPlan;
  dinner?: MealPlan;
};

export type MealPlan = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  recipes: Recipe[];
};

export type DailyPlanStoreRequest = {
  day: string;
  breakfast?: MealPlan;
  lunch?: MealPlan;
  dinner?: MealPlan;
};

export type GenerateImageRequest = {
  recipeName: string;
};

export type GenerateImageResponse = {
  imageUrl: string;
};

export type GenerateRecipeRequest = {
  include: string[];
  exclude: string[];
};

export type GeneratedRecipe = {
  name: string;
  description: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  preparationTime: string;
  cookingTime: string;
  allTime: string;
  portions: string;
};

export type GenerateCustomEntityRequest = {
  userInput: string;
};
