export const Endpoints = {
  clientUser: '/clientuser',
  message: '/message',
  recipe: '/recipe',
  menu: '/menu',
  dailyPlan: '/dailyPlan',
  generateRecipe: 'generate/recipe',
  generateDailyIntake: 'generate/dailyintake',
  generateDailyPlan: 'generate/dailyplan',
  generateMenu: 'generate/menu',
  generateImage: 'generate/image',
  generateCustomRecipe: 'generate/customrecipe',
  generateCustomMenu: 'generate/custommenu',
};

export const Keys = {
  allRecipes: [Endpoints.recipe] as const,
  recipePage: (page: number, filter: string) => [Endpoints.recipe, { page, filter }] as const,
  recipeById: (recipeId: string) => [Endpoints.recipe, { recipeId }] as const,
  clientUser: [Endpoints.clientUser] as const,
};
