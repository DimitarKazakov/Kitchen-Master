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

import { useGetClientUser } from '../../api/clientUserController';
import { DailyPlan } from '../../api/entities';
import { generateDailyPlan } from '../../api/generateController';

type FormData = {
  protein: number;
  carbohydrates: number;
  fats: number;
  calories: number;
  includeBreakfast: boolean;
  includeLunch: boolean;
  includeDinner: boolean;
};

type GenerateDailyPlanTabProps = {
  setSelectedTab: Dispatch<SetStateAction<number>>;
  setIsGenerated: Dispatch<SetStateAction<boolean>>;
  setSelectedDailyPlan: Dispatch<SetStateAction<DailyPlan | undefined>>;
};

export const GenerateDailyPlanTab = (props: GenerateDailyPlanTabProps) => {
  const { setSelectedTab, setIsGenerated, setSelectedDailyPlan } = props;
  const { data: clientUser } = useGetClientUser();
  const [generateBtnLoading, setGenerateBtnLoading] = useState(false);

  const { control, register, formState, reset, setValue, trigger } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      calories: 2000,
      carbohydrates: 200,
      protein: 150,
      fats: 67,
      includeBreakfast: true,
      includeDinner: true,
      includeLunch: true,
    },
  });

  useEffect(() => {
    trigger();
  }, []);

  const formData = useWatch({ control: control });

  useEffect(() => {
    if (clientUser?.subscription === 'FREE') {
      setSelectedTab(0);
    }
  }, [clientUser]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{ margin: '10px', width: '98%', height: '70%', minHeight: '500px' }}
      gap="20px"
    >
      {generateBtnLoading ? (
        <Box
          display="flex"
          flexDirection="column"
          width="90%"
          height="500px"
          marginLeft="50px"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress></CircularProgress>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              flexWrap: 'wrap',
              marginTop: '50px',
              marginBottom: '50px',
              marginLeft: 'auto',
              marginRight: 'auto',
              width: '80%',
            }}
            display="flex"
            gap="30px"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" flexDirection="column" gap="20px" width="50%">
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

              <Box display="flex" alignItems="center" justifyContent="space-around">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includeBreakfast}
                      onChange={() => {
                        setValue('includeBreakfast', !formData.includeBreakfast);
                      }}
                    />
                  }
                  label={<Typography color="black">Include Breakfast</Typography>}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includeLunch}
                      onChange={() => {
                        setValue('includeLunch', !formData.includeLunch);
                      }}
                    />
                  }
                  label={<Typography color="black">Include Lunch</Typography>}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includeDinner}
                      onChange={() => {
                        setValue('includeDinner', !formData.includeDinner);
                      }}
                    />
                  }
                  label={<Typography color="black">Include Dinner</Typography>}
                />
              </Box>
            </Box>

            <Button
              sx={{ padding: '10px', height: '50px', width: '250px' }}
              disabled={
                generateBtnLoading ||
                clientUser?.subscription === 'FREE' ||
                !formState.isValid ||
                (!formData.includeBreakfast && !formData.includeLunch && !formData.includeDinner)
              }
              variant="contained"
              onClick={() => {
                setGenerateBtnLoading(true);
                generateDailyPlan({
                  calories: Number.parseFloat(formData.calories?.toString() ?? '') || 2000,
                  protein: Number.parseFloat(formData.protein?.toString() ?? '') || 150,
                  carbohydrates: Number.parseFloat(formData.calories?.toString() ?? '') || 200,
                  fats: Number.parseFloat(formData.fats?.toString() ?? '') || 67,
                  includeBreakfast: formData.includeBreakfast ?? false,
                  includeLunch: formData.includeLunch ?? false,
                  includeDinner: formData.includeDinner ?? false,
                })
                  .then((x) => {
                    setGenerateBtnLoading(false);
                    setIsGenerated(true);
                    setSelectedDailyPlan({
                      Id: '',
                      userId: clientUser?.Id ?? '',
                      name: '',
                      day: 'Monday',
                      breakfast: x.breakfast
                        ? {
                            calories: 660,
                            protein: 50,
                            carbohydrates: 66,
                            fats: 23,
                            recipes: [{ ...x.breakfast, Id: '', notes: '' }],
                          }
                        : undefined,

                      lunch: x.lunch
                        ? {
                            calories: 660,
                            protein: 50,
                            carbohydrates: 66,
                            fats: 23,
                            recipes: [{ ...x.lunch, Id: '', notes: '' }],
                          }
                        : undefined,

                      dinner: x.dinner
                        ? {
                            calories: 660,
                            protein: 50,
                            carbohydrates: 66,
                            fats: 23,
                            recipes: [{ ...x.dinner, Id: '', notes: '' }],
                          }
                        : undefined,
                    });
                    setSelectedTab(1);
                  })

                  .catch(() => {
                    setGenerateBtnLoading(false);
                  });
              }}
            >
              {clientUser?.subscription === 'FREE' && <LockIcon />}
              Generate Daily Plan
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};
