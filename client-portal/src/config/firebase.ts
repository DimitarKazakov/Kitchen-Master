// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

import { envConfig } from './environment.config';

const firebaseConfig = {
  apiKey: envConfig.FirebaseApiKey,
  authDomain: envConfig.FirebaseAuthDomain,
  projectId: envConfig.FirebaseProjectId,
  storageBucket: envConfig.FirebaseStorageBucket,
  messagingSenderId: envConfig.FirebaseMessagingSenderId,
  appId: envConfig.FirebaseAppId,
  measurementId: envConfig.FirebaseMeasurementId,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
