import { useEffect } from 'react';
import GoogleButton from 'react-google-button';
import { Form, useForm } from 'react-hook-form';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { useRouter } from 'next/router';

import { firebaseAuth } from '../config/firebase';

type SignupForm = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
export default function Signup() {
  const { register, control } = useForm<SignupForm>({
    mode: 'onChange',
  });

  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        router.push('/profile');
      }
    });
  }, [router]);

  const onSubmitData = async (data: SignupForm) => {
    await createUserWithEmailAndPassword(firebaseAuth, data.email, data.password)
      .then((userCredential) => {
        updateProfile(userCredential.user, {
          displayName: `${data.firstName} ${data.lastName}`,
        }).then(() => {
          router.push('/');
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" color="black" sx={{ mb: 2 }}>
          Sign up
        </Typography>
        <Form control={control} onSubmit={({ data }) => onSubmitData(data)} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                required
                fullWidth
                id="firstName"
                label="First Name"
                autoFocus
                {...register('firstName', {
                  required: true,
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                autoComplete="family-name"
                {...register('lastName', {
                  required: true,
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                autoComplete="email"
                {...register('email', {
                  required: true,
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                {...register('password', {
                  required: true,
                })}
              />
            </Grid>
          </Grid>

          <Box sx={{ marginTop: '12px' }}>
            <GoogleButton
              onClick={() => {
                const googleProvider = new GoogleAuthProvider();
                signInWithPopup(firebaseAuth, googleProvider)
                  .then((result) => {
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    router.push('/');
                  })
                  .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                  });
              }}
            />
          </Box>

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Sign Up
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Form>
      </Box>
    </Container>
  );
}
