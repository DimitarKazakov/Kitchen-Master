import { QueryOptions } from '@tanstack/react-query';

import { clientAxios } from '../config/axios.config';
import { useMutationRequest, useQueryRequest } from '../config/query.config';
import { Endpoints, Keys } from './endpoints';
import { Menu, MenuStoreRequest } from './entities';

// ? Requests
export const getMenus = async (): Promise<Menu[]> => {
  const response = await clientAxios.get(`${Endpoints.menu}`);
  return response.data as Menu[];
};

export const postMenu = async (data: MenuStoreRequest, createRecipes: boolean): Promise<void> => {
  if (createRecipes) {
    await clientAxios.post(`${Endpoints.menu}?createRecipes=true`, data);
  } else {
    await clientAxios.post(`${Endpoints.menu}`, data);
  }
};

export const putMenu = async (menuId: string, data: MenuStoreRequest): Promise<void> => {
  await clientAxios.put(`${Endpoints.menu}/${menuId}`, data);
};

export const deleteMenu = async (menuId: string): Promise<void> => {
  await clientAxios.delete(`${Endpoints.menu}/${menuId}`);
};

// ? Query Hooks
export const useGetMenus = (options?: QueryOptions<Menu[]>) => {
  return useQueryRequest({
    func: () => getMenus(),
    key: Keys.allMenus,
    options,
  });
};

export const usePostMenuMutation = () => {
  return useMutationRequest({
    func: (request: { createRecipes: boolean; data: MenuStoreRequest }) =>
      postMenu(request.data, request.createRecipes),
    invalidateKeys: [Keys.allMenus],
  });
};

export const usePutMenuMutation = () => {
  return useMutationRequest({
    func: (request: { menuId: string; data: MenuStoreRequest }) =>
      putMenu(request.menuId, request.data),
    invalidateKeys: [Keys.allMenus],
  });
};

export const useDeleteMenuMutation = () => {
  return useMutationRequest({
    func: (menuId: string) => deleteMenu(menuId),
    invalidateKeys: [Keys.allMenus],
  });
};
