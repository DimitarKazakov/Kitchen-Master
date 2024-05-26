import { clientAxios } from '../config/axios.config';
import { QueryOptions, useMutationRequest, useQueryRequest } from '../config/query.config';
import { Endpoints, Keys } from './endpoints';
import { DailyPlan, DailyPlanStoreRequest } from './entities';

// ? Requests
export const getDailyPlans = async (): Promise<DailyPlan[]> => {
  const response = await clientAxios.get(`${Endpoints.dailyPlan}`);
  return response.data as DailyPlan[];
};

export const postDailyPlan = async (
  data: DailyPlanStoreRequest,
  createRecipes: boolean,
): Promise<void> => {
  if (createRecipes) {
    await clientAxios.post(`${Endpoints.dailyPlan}?createRecipes=true`, data);
  } else {
    await clientAxios.post(`${Endpoints.dailyPlan}`, data);
  }
};

export const putDailyPlan = async (
  dailyPlanId: string,
  data: DailyPlanStoreRequest,
): Promise<void> => {
  await clientAxios.put(`${Endpoints.dailyPlan}/${dailyPlanId}`, data);
};

export const deleteDailyPlan = async (dailyPlanId: string): Promise<void> => {
  await clientAxios.delete(`${Endpoints.dailyPlan}/${dailyPlanId}`);
};

// ? Query Hooks
export const useGetDailyPlans = (options?: QueryOptions<DailyPlan[]>) => {
  return useQueryRequest({
    func: () => getDailyPlans(),
    key: Keys.allDailyPlan,
    options,
  });
};

export const usePostDailyPlanMutation = () => {
  return useMutationRequest({
    func: (request: { data: DailyPlanStoreRequest; createRecipes: boolean }) =>
      postDailyPlan(request.data, request.createRecipes),
    invalidateKeys: [Keys.allDailyPlan],
  });
};

export const usePutDailyPlanMutation = () => {
  return useMutationRequest({
    func: (request: { dailyPlanId: string; data: DailyPlanStoreRequest }) =>
      putDailyPlan(request.dailyPlanId, request.data),
    invalidateKeys: [Keys.allDailyPlan],
  });
};

export const useDeleteDailyPlanMutation = () => {
  return useMutationRequest({
    func: (dailyPlanId: string) => deleteDailyPlan(dailyPlanId),
    invalidateKeys: [Keys.allDailyPlan],
  });
};
