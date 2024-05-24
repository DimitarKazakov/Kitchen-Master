import { QueryOptions } from '@tanstack/react-query';

import { clientAxios } from '../config/axios.config';
import { useQueryRequest } from '../config/query.config';
import { Endpoints, Keys } from './endpoints';
import { ClientUser } from './entities';

export const getClientUser = async (): Promise<ClientUser> => {
  const response = await clientAxios.get(Endpoints.clientUser);

  return response.data as ClientUser;
};

export const useGetClientUser = (options?: QueryOptions<ClientUser>) => {
  return useQueryRequest({
    func: () => getClientUser(),
    key: Keys.clientUser,
    options,
  });
};
