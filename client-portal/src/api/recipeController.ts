import { QueryOptions } from '@tanstack/react-query';
import qs from 'qs';

import { clientAxios } from '../config/axios.config';
import { useMutationRequest, useQueryRequest } from '../config/query.config';
import { Endpoints, Keys } from './endpoints';
import { Recipe, RecipeResponse, RecipeStoreRequest } from './entities';

// ? Requests
export const getRecipes = async (
  search: string,
  page: number,
  size?: number,
): Promise<RecipeResponse> => {
  const defaultPageSize = size ?? 12;
  const params = qs.stringify({
    search: search || undefined,
    limit: defaultPageSize,
    offset: (page - 1) * defaultPageSize,
  });

  const response = await clientAxios.get(`${Endpoints.recipe}?${params}`);

  return response.data as RecipeResponse;
};

export const getRecipeById = async (recipeId: string): Promise<Recipe> => {
  const response = await clientAxios.get(`${Endpoints.recipe}/${recipeId}`);

  return response.data as Recipe;
};

export const postRecipe = async (data: RecipeStoreRequest): Promise<void> => {
  await clientAxios.post(`${Endpoints.recipe}`, data);
};

export const putRecipe = async (recipeId: string, data: RecipeStoreRequest): Promise<void> => {
  await clientAxios.put(`${Endpoints.recipe}/${recipeId}`, data);
};

export const deleteRecipe = async (recipeId: string): Promise<void> => {
  await clientAxios.delete(`${Endpoints.recipe}/${recipeId}`);
};

// ? Query Hooks
export const useGetRecipes = (
  search: string,
  page: number,
  size?: number,
  options?: QueryOptions<RecipeResponse>,
) => {
  return useQueryRequest({
    func: () => getRecipes(search, page, size),
    key: Keys.recipePage(page, search),
    options,
  });
};

export const useGetRecipeById = (recipeId: string, options?: QueryOptions<Recipe>) => {
  return useQueryRequest({
    func: () => getRecipeById(recipeId),
    key: Keys.recipeById(recipeId),
    options,
  });
};

export const usePostRecipeMutation = () => {
  return useMutationRequest({
    func: (data: RecipeStoreRequest) => postRecipe(data),
    invalidateKeys: [Keys.allRecipes],
  });
};

export const usePutRecipeMutation = () => {
  return useMutationRequest({
    func: (request: { recipeId: string; data: RecipeStoreRequest }) =>
      putRecipe(request.recipeId, request.data),
    invalidateKeys: [Keys.allRecipes],
  });
};

export const useDeleteRecipeMutation = () => {
  return useMutationRequest({
    func: (recipeId: string) => deleteRecipe(recipeId),
    invalidateKeys: [Keys.allRecipes],
  });
};
