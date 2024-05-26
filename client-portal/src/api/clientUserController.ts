import { QueryOptions } from '@tanstack/react-query';

import { clientAxios } from '../config/axios.config';
import { useMutationRequest, useQueryRequest } from '../config/query.config';
import { Endpoints, Keys } from './endpoints';
import { ClientUser, ClientUserStoreRequest } from './entities';

export const getClientUser = async (): Promise<ClientUser> => {
  const response = await clientAxios.get(Endpoints.clientUser);

  return response.data as ClientUser;
};

export const updateClientUser = async (data: ClientUserStoreRequest) => {
  await clientAxios.put(Endpoints.clientUser, data);
};

export const useGetClientUser = (options?: QueryOptions<ClientUser>) => {
  return useQueryRequest({
    func: () => getClientUser(),
    key: Keys.clientUser,
    options,
  });
};

export const usePutClientUserMutation = () => {
  return useMutationRequest({
    func: (data: ClientUserStoreRequest) => updateClientUser(data),
    invalidateKeys: [Keys.clientUser],
  });
};
