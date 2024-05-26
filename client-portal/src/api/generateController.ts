import { clientAxios } from '../config/axios.config';
import { Endpoints } from './endpoints';
import {
  GenerateCustomEntityRequest,
  GenerateDailyPlanRequest,
  GenerateImageRequest,
  GenerateImageResponse,
  GenerateIntakeRequest,
  GenerateIntakeResponse,
  GenerateMenuRequest,
  GenerateRecipeRequest,
  GeneratedDailyPlanResponse,
  GeneratedMenu,
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

export const generateCustomMenu = async (
  data: GenerateCustomEntityRequest,
): Promise<GeneratedMenu> => {
  const response = await clientAxios.post(
    `${Endpoints.generateCustomMenu}?generateImage=true`,
    data,
  );
  return response.data as GeneratedMenu;
};

export const generateMenu = async (data: GenerateMenuRequest): Promise<GeneratedMenu> => {
  const response = await clientAxios.post(`${Endpoints.generateMenu}?generateImage=true`, data);
  return response.data as GeneratedMenu;
};

export const generateDailyIntake = async (
  data: GenerateIntakeRequest,
): Promise<GenerateIntakeResponse> => {
  const response = await clientAxios.post(`${Endpoints.generateDailyIntake}`, data);
  return response.data as GenerateIntakeResponse;
};

export const generateDailyPlan = async (
  data: GenerateDailyPlanRequest,
): Promise<GeneratedDailyPlanResponse> => {
  const response = await clientAxios.post(
    `${Endpoints.generateDailyPlan}?generateImage=true`,
    data,
  );
  return response.data as GeneratedDailyPlanResponse;
};
