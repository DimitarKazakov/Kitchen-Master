export type EnvironmentType = 'DEV' | 'PROD';
export interface EnvironmentConfig {
  ApiBaseUrl: string;
  Environment: EnvironmentType;

  FirebaseApiKey: string;
  FirebaseAuthDomain: string;
  FirebaseProjectId: string;
  FirebaseStorageBucket: string;
  FirebaseMessagingSenderId: string;
  FirebaseMeasurementId: string;
  FirebaseAppId: string;
}

const getConfig = (): EnvironmentConfig => {
  return {
    ApiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    Environment: process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD' ? 'PROD' : 'DEV',
    FirebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    FirebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    FirebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    FirebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_ID || '',
    FirebaseMessagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    FirebaseMeasurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
    FirebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };
};

export const envConfig = getConfig();
