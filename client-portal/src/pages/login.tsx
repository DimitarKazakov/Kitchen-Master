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
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { useRouter } from 'next/router';

import { firebaseAuth } from '../config/firebase';

type LoginForm = {
  email: string;
  password: string;
};

export default function Login() {
  const { register, control, formState } = useForm<LoginForm>({
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

  const onSubmitData = (data: LoginForm) => {
    signInWithEmailAndPassword(firebaseAuth, data.email, data.password)
      .then((userCredential) => {
        router.push('/');
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
        <Typography component="h1" variant="h5" color="black">
          Login
        </Typography>

        <Form control={control} onSubmit={({ data }) => onSubmitData(data)} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            {...register('email', {
              required: true,
            })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            {...register('password', {
              required: true,
            })}
          />

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

          <Button
            disabled={!formState.isValid}
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>

          <Grid container>
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Form>
      </Box>
    </Container>
  );
}
