import { clientAxios } from '../config/axios.config';
import { Endpoints } from './endpoints';
import {
  GenerateCustomEntityRequest,
  GenerateImageRequest,
  GenerateImageResponse,
  GenerateRecipeRequest,
  GeneratedRecipe,
} from './entities';

export const generateImage = async (data: GenerateImageRequest): Promise<GenerateImageResponse> => {
  const response = await clientAxios.post(`${Endpoints.generateImage}`, data);
  return response.data as GenerateImageResponse;
};

export const generateRecipe = async (data: GenerateRecipeRequest): Promise<GeneratedRecipe> => {
  const response = await clientAxios.post(`${Endpoints.generateRecipe}?generateImage=true`, data);
  return response.data as GeneratedRecipe;
};

export const generateCustomRecipe = async (
  data: GenerateCustomEntityRequest,
): Promise<GeneratedRecipe> => {
  const response = await clientAxios.post(
    `${Endpoints.generateCustomRecipe}?generateImage=true`,
    data,
  );
  return response.data as GeneratedRecipe;
};
