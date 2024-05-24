import { MouseEventHandler } from 'react';

import {
  MutationFunction,
  QueryCache,
  QueryClient,
  QueryFunction,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    },
  },
  queryCache: new QueryCache({
    onError: (_error) => {},
  }),
});

export type QueryOptions<TResult> = Omit<
  UseQueryOptions<TResult, unknown, TResult, QueryKey>,
  'queryKey' | 'queryFn'
>;

interface GetRequestProps<TResult> {
  func: QueryFunction<TResult>;
  key: QueryKey;
  options?: QueryOptions<TResult>;
}

export const useQueryRequest = <TResult>(
  request: GetRequestProps<TResult>,
): UseQueryResult<TResult> => {
  return useQuery({ queryKey: request.key, queryFn: request.func, ...request.options });
};

export interface MutationRequestProps<TData, TVariables> {
  func: MutationFunction<TData, TVariables>;
  invalidateKeys?: QueryKey | QueryKey[];
  onSuccess?: {
    message: string;
    actionMessage?: string;
    actionClick?: MouseEventHandler<HTMLButtonElement>;
  };
  onError?: {
    message: string;
    actionMessage?: string;
    actionClick?: MouseEventHandler<HTMLButtonElement>;
  };
  disableSuccessNotification?: boolean;
  disableErrorNotification?: boolean;
}

export const useMutationRequest = <TData, TVariables>(
  request: MutationRequestProps<TData, TVariables>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: request.func,
    onSuccess: async <TResponse>(_response: TResponse) => {
      let keys = request.invalidateKeys;
      if (keys) {
        if (!Array.isArray(keys)) {
          keys = [keys];
        }

        (keys as QueryKey[]).forEach((key) => queryClient.invalidateQueries({ queryKey: key }));

        if (!request.disableSuccessNotification && request.onSuccess?.message) {
          // showSuccess(
          //   request.onSuccess.message,
          //   request.onSuccess.actionMessage,
          //   request.onSuccess.actionClick,
          // );
        }
      }
    },
    onError: async (_error: Error) => {
      if (!request.disableErrorNotification && request.onError?.message) {
        // showError(
        //   request.onError.message,
        //   request.onError.actionMessage,
        //   request.onError.actionClick,
        // );
      }
    },
  });
};
