import axios from 'axios';

import { envConfig } from './environment.config';
import { firebaseAuth } from './firebase';

export const commonHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export const clientAxios = axios.create({
  baseURL: envConfig.ApiBaseUrl,
  timeout: 5 * 60 * 1000,
  headers: {
    ...commonHeaders,
  },
});

// ? Before request
clientAxios.interceptors.request.use(
  async (config) => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      return config;
    }

    const jwt = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${jwt}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ? After request
clientAxios.interceptors.response.use(
  async (response) => response,
  async (error) => {
    const responseStatusCode = error.response ? error.response.status : null;
    if (responseStatusCode === 401 || responseStatusCode === 403) {
      firebaseAuth.signOut();
    }

    return Promise.reject(error);
  },
);
