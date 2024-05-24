import { clientAxios } from '../config/axios.config';
import { useMutationRequest } from '../config/query.config';
import { Endpoints } from './endpoints';

type Message = {
  title: string;
  content: string;
};

export const postMessage = async (data: Message): Promise<void> => {
  await clientAxios.post(Endpoints.message, data);
};

export const usePostMessageMutation = () => {
  return useMutationRequest({
    func: (data: Message) => postMessage(data),
    invalidateKeys: [],
  });
};
