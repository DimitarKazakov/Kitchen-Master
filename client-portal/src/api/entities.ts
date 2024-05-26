export type ClientUser = {
  Id: string;
  username: string;
  email: string;
  elasticIndex: string;
  importedRecipes: string[];
  autoImportEnabled: boolean;
  subscription: 'FREE' | 'PRO'; // NOTE: currently upgrade only with message
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
  name: string;
  recipes: Recipe[];
};

export type MenuStoreRequest = {
  event: string;
  name: string;
  recipes: Recipe[];
};

export type GenerateIntakeRequest = {
  height: number;
  currentWeight: number;
  desiredWeight: number;
};

export type GenerateIntakeResponse = {
  program: {
    protein: number;
    carbohydrates: number;
    fats: number;
    calories: number;
  };
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
  name: string;
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
  name: string;
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

export type GenerateMenuRequest = {
  event: string;
  numberOfPeople: number;
  numberOfCourses: number;
  exclude: string[];
  includeDrinks: boolean;
  includeCocktails: boolean;
  excludeDessert: boolean;
};

export type GeneratedMenu = {
  menu: GeneratedRecipe[];
};

export type GenerateDailyPlanRequest = {
  protein: number;
  carbohydrates: number;
  fats: number;
  calories: number;
  includeBreakfast: boolean;
  includeLunch: boolean;
  includeDinner: boolean;
};

export type GeneratedDailyPlanResponse = {
  breakfast?: GeneratedRecipe;
  lunch?: GeneratedRecipe;
  dinner?: GeneratedRecipe;
};
