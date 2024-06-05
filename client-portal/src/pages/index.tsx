import { useEffect } from 'react';

import { Box, Divider } from '@mui/material';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';

import AppAppBar from '../components/landingPage/AppAppBar';
import FAQ from '../components/landingPage/FAQ';
import Features from '../components/landingPage/Features';
import Footer from '../components/landingPage/Footer';
import Highlights from '../components/landingPage/Highlights';
import Pricing from '../components/landingPage/Pricing';
import { firebaseAuth } from '../config/firebase';

export const Home = () => {
  const router = useRouter();
  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        router.push('/profile');
      }
    });
  }, [router]);

  return (
    <>
      <AppAppBar />
      <Box sx={{ bgcolor: 'background.default' }}>
        <Features />
        <Divider />

        <Highlights />
        <Divider />

        <Pricing />
        <Divider />

        <FAQ />
        <Divider />

        <Footer />
      </Box>
    </>
  );
};

export default Home;
