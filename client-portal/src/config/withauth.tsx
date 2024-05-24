import { ReactElement, ReactNode, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { firebaseAuth } from './firebase';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export const withAuth = <P extends object>(Component: NextPageWithLayout): React.FC<P> => {
  const getLayout = Component.getLayout ?? ((page) => page);

  const Authenticated: React.FC<P> = (props) => {
    const queryClient = useQueryClient();

    const router = useRouter();
    useEffect(() => {
      onAuthStateChanged(firebaseAuth, (user) => {
        if (!user) {
          router.push('/login');
        }
      });
    }, [router]);

    return getLayout(<Component {...props} />) as any;
  };

  return Authenticated;
};
