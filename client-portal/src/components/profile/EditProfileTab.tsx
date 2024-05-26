import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import LockIcon from '@mui/icons-material/Lock';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';

import { useGetClientUser, usePutClientUserMutation } from '../../api/clientUserController';
import { ClientUserStoreRequest } from '../../api/entities';
import { generateDailyIntake } from '../../api/generateController';

type EditProfileTabProps = {
  setSelectedTab: Dispatch<SetStateAction<number>>;
};

type FormData = {
  username: string;
  autoImportEnabled: boolean;
  height: number;
  weight: number;
  protein: number;
  desiredWeight: number;
  carbohydrates: number;
  fats: number;
  calories: number;
};

export const EditProfileTab = (props: EditProfileTabProps) => {
  const { setSelectedTab } = props;

  const { data: clientUser } = useGetClientUser();

  const { control, register, formState, reset, setValue, trigger } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      username: clientUser?.username ?? '',
      autoImportEnabled: clientUser?.autoImportEnabled ?? false,
      height: clientUser?.height ?? 0,
      weight: clientUser?.weight ?? 0,
      protein: clientUser?.protein ?? 0,
      carbohydrates: clientUser?.carbohydrates ?? 0,
      fats: clientUser?.fats ?? 0,
      calories: clientUser?.calories ?? 0,
      desiredWeight: 0,
    },
  });

  useEffect(() => {
    trigger();
  }, []);

  const updateClientUserMutation = usePutClientUserMutation();

  const [disableBtn, setDisableBtn] = useState(false);
  const [generateBtnLoading, setGenerateBtnLoading] = useState(false);

  const submitData = (data: FormData) => {
    const request: ClientUserStoreRequest = {
      username: data.username.replaceAll('"', '').trim(),
      autoImportEnabled: data.autoImportEnabled,
      protein: Number.parseInt(data.protein.toString()),
      carbohydrates: Number.parseInt(data.carbohydrates.toString()),
      fats: Number.parseInt(data.fats.toString()),
      calories: Number.parseInt(data.calories.toString()),
      weight: Number.parseInt(data.weight.toString()),
      height: Number.parseInt(data.height.toString()),
      favoriteRecipeIDs: clientUser?.favoriteRecipeIDs ?? [],
      allergies: clientUser?.allergies ?? [],
    };

    setDisableBtn(true);

    updateClientUserMutation.mutateAsync(request).then(() => {
      setDisableBtn(false);
      setSelectedTab(0);
      reset();
    });
  };

  const formData = useWatch({ control: control });

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{
        marginTop: '10px',
        marginBottom: '10px',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '50%',
      }}
      gap="20px"
    >
      <TextField
        fullWidth
        label="Username"
        id="username"
        {...register('username', {
          required: true,
        })}
      />

      <Box display="flex" flexDirection="column" alignItems="center" gap="20px">
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(formData.autoImportEnabled)}
              onChange={() => {
                setValue('autoImportEnabled', !formData.autoImportEnabled);
              }}
            />
          }
          label={<Typography color="black">Recipes auto import enabled</Typography>}
        />
      </Box>

      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        gap="10px"
        alignItems="center"
      >
        <Box
          width="40%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          gap="50px"
        >
          <TextField
            fullWidth
            type="number"
            label="Height"
            id="height"
            {...register('height', {
              required: true,
              min: 0,
            })}
          />

          <TextField
            fullWidth
            type="number"
            label="Weight"
            id="weight"
            {...register('weight', {
              required: true,
              min: 0,
            })}
          />
        </Box>

        <Box
          width="40%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          gap="20px"
        >
          <TextField
            fullWidth
            type="number"
            label="Desired Weight"
            id="desiredWeight"
            {...register('desiredWeight', {
              required: true,
              min: 0,
            })}
          />

          <Button
            sx={{ padding: '10px' }}
            disabled={!formData.weight || !formData.height || !formData.desiredWeight}
            variant="contained"
            onClick={() => {
              setGenerateBtnLoading(true);
              generateDailyIntake({
                height: Number.parseInt(formData.height?.toString() ?? '170'),
                currentWeight: Number.parseInt(formData.weight?.toString() ?? '100'),
                desiredWeight: Number.parseInt(formData.desiredWeight?.toString() ?? '80'),
              })
                .then((x) => {
                  setValue('protein', x.program.protein);
                  setValue('carbohydrates', x.program.carbohydrates);
                  setValue('fats', x.program.fats);
                  setValue('calories', x.program.calories);
                  setGenerateBtnLoading(false);
                })
                .catch(() => {
                  setGenerateBtnLoading(false);
                });
            }}
          >
            {generateBtnLoading && <CircularProgress />}
            {clientUser?.subscription === 'FREE' && <LockIcon />}
            Generate Daily Intake
          </Button>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-around" gap="20px">
        <TextField
          fullWidth
          type="number"
          label="Protein"
          id="protein"
          {...register('protein', {
            required: true,
            min: 0,
          })}
        />

        <TextField
          fullWidth
          type="number"
          label="Carbohydrates"
          id="carbohydrates"
          {...register('carbohydrates', {
            required: true,
            min: 0,
          })}
        />

        <TextField
          fullWidth
          type="number"
          label="Fats"
          id="fats"
          {...register('fats', {
            required: true,
            min: 0,
          })}
        />

        <TextField
          fullWidth
          type="number"
          label="Calories"
          id="calories"
          {...register('calories', {
            required: true,
            min: 0,
          })}
        />
      </Box>

      <Box width="60%" display="flex" alignItems="center" gap="20px" justifyContent="space-between">
        <Button
          sx={{ width: '150px' }}
          variant="contained"
          onClick={() => {
            reset();
            setValue('autoImportEnabled', clientUser?.autoImportEnabled ?? false);
          }}
        >
          Clear All
        </Button>
        <Button
          onClick={() => {
            submitData(formData as FormData);
          }}
          variant="contained"
          disabled={!formState.isValid || disableBtn}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
};
