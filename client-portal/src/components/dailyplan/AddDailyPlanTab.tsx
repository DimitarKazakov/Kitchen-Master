import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';

import { usePostDailyPlanMutation, usePutDailyPlanMutation } from '../../api/dailyPlanController';
import { DailyPlan, DailyPlanStoreRequest, MealPlan, Recipe } from '../../api/entities';
import { RecipesAutocomplete } from '../menus/RecipesAutocomplete';
import { SimpleRecipeCard } from '../menus/SimpleRecipeCard';
import { RecipeDetails } from '../recipes/RecipeDetails';
import { DaySelect } from './DaySelect';

type AddDailyPlanTabProps = {
  isGenerated: boolean;
  selectedDailyPlan: DailyPlan | undefined;
  setSelectedTab: Dispatch<SetStateAction<number>>;
};

export type DailyPlanFormData = {
  name: string;
  day: string;
  breakfast?: MealPlan;
  lunch?: MealPlan;
  dinner?: MealPlan;
};

export const AddDailyPlanTab = (props: AddDailyPlanTabProps) => {
  const { isGenerated, selectedDailyPlan, setSelectedTab } = props;

  const [openDetails, setOpenDetails] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(undefined);
  const [disableBtn, setDisableBtn] = useState(false);

  const { control, register, formState, reset, setValue, trigger } = useForm<DailyPlanFormData>({
    mode: 'onChange',
    defaultValues: {
      name: selectedDailyPlan?.name ?? '',
      day: selectedDailyPlan?.day ?? 'Monday',
      breakfast: selectedDailyPlan?.breakfast ?? undefined,
      lunch: selectedDailyPlan?.lunch ?? undefined,
      dinner: selectedDailyPlan?.dinner ?? undefined,
    },
  });

  useEffect(() => {
    trigger();
  }, []);

  const formData = useWatch({ control: control });

  const createDailyPlanMutation = usePostDailyPlanMutation();
  const updateDailyPlanMutation = usePutDailyPlanMutation();

  const submitData = (data: DailyPlanFormData) => {
    const request: DailyPlanStoreRequest = {
      name: data.name.replaceAll('"', '').trim(),
      day: data.day.replaceAll('"', '').trim(),
      breakfast:
        data.breakfast === undefined
          ? undefined
          : {
              protein: Number.parseInt(data.breakfast.protein.toString()),
              carbohydrates: Number.parseInt(data.breakfast.carbohydrates.toString()),
              fats: Number.parseInt(data.breakfast.fats.toString()),
              calories: Number.parseInt(data.breakfast.calories.toString()),
              recipes: data.breakfast.recipes,
            },
      lunch:
        data.lunch === undefined
          ? undefined
          : {
              protein: Number.parseInt(data.lunch.protein.toString()),
              carbohydrates: Number.parseInt(data.lunch.carbohydrates.toString()),
              fats: Number.parseInt(data.lunch.fats.toString()),
              calories: Number.parseInt(data.lunch.calories.toString()),
              recipes: data.lunch.recipes,
            },
      dinner:
        data.dinner === undefined
          ? undefined
          : {
              protein: Number.parseInt(data.dinner.protein.toString()),
              carbohydrates: Number.parseInt(data.dinner.carbohydrates.toString()),
              fats: Number.parseInt(data.dinner.fats.toString()),
              calories: Number.parseInt(data.dinner.calories.toString()),
              recipes: data.dinner.recipes,
            },
    };

    setDisableBtn(true);

    if (selectedDailyPlan && !isGenerated) {
      updateDailyPlanMutation
        .mutateAsync({ dailyPlanId: selectedDailyPlan.Id, data: request })
        .then(() => {
          setDisableBtn(false);
          setSelectedTab(0);
          reset();
        });
    } else {
      createDailyPlanMutation
        .mutateAsync({ data: request, createRecipes: isGenerated })
        .then(() => {
          setDisableBtn(false);
          setSelectedTab(0);
          reset();
        });
    }
  };

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
        width: '80%',
      }}
      gap="20px"
    >
      <Box display="flex" width="100%" alignItems="center" justifyContent="space-around" gap="20px">
        <TextField
          fullWidth
          label="Name"
          id="name"
          {...register('name', {
            required: true,
          })}
        />

        <DaySelect formData={formData as DailyPlanFormData} setValue={setValue} />
      </Box>

      <Box display="flex" flexDirection="column" alignItems="center" gap="20px">
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(formData.breakfast)}
              onChange={() => {
                if (formData.breakfast) {
                  setValue('breakfast', undefined);
                } else {
                  setValue('breakfast', {
                    calories: 0,
                    protein: 0,
                    carbohydrates: 0,
                    fats: 0,
                    recipes: [],
                  });
                }
              }}
            />
          }
          label={<Typography color="black">Include Breakfast</Typography>}
        />

        {Boolean(formData.breakfast) && (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-around" gap="20px">
              <TextField
                fullWidth
                type="number"
                label="Protein"
                id="breakfast.protein"
                {...register('breakfast.protein', {
                  required: true,
                  min: 0,
                })}
              />

              <TextField
                fullWidth
                type="number"
                label="Carbohydrates"
                id="breakfast.carbohydrates"
                {...register('breakfast.carbohydrates', {
                  required: true,
                  min: 0,
                })}
              />

              <TextField
                fullWidth
                type="number"
                label="Fats"
                id="breakfast.fats"
                {...register('breakfast.fats', {
                  required: true,
                  min: 0,
                })}
              />

              <TextField
                fullWidth
                type="number"
                label="Calories"
                id="breakfast.calories"
                {...register('breakfast.calories', {
                  required: true,
                  min: 0,
                })}
              />
            </Box>
            <Box width="80%">
              <RecipesAutocomplete
                id="breakfast.recipes"
                currentRecipes={(formData.breakfast?.recipes as Recipe[]) ?? []}
                setValue={setValue}
              />
            </Box>
            <Divider sx={{ margin: '5px' }} />
            <Box
              justifyContent="space-around"
              alignItems="center"
              display="flex"
              gap="20px"
              sx={{ flexWrap: 'wrap', width: '100%' }}
            >
              {formData.breakfast?.recipes?.map((x) => (
                <SimpleRecipeCard
                  id="breakfast.recipes"
                  currentRecipes={(formData.breakfast?.recipes as Recipe[]) ?? []}
                  setValue={setValue}
                  setOpenDetails={setOpenDetails}
                  setSelectedRecipe={setSelectedRecipe}
                  key={`${x.Id}-${x.name}`}
                  item={x as Recipe}
                />
              ))}
            </Box>
          </>
        )}
      </Box>

      <Box display="flex" flexDirection="column" alignItems="center" gap="20px">
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(formData.lunch)}
              onChange={() => {
                if (formData.lunch) {
                  setValue('lunch', undefined);
                } else {
                  setValue('lunch', {
                    calories: 0,
                    protein: 0,
                    carbohydrates: 0,
                    fats: 0,
                    recipes: [],
                  });
                }
              }}
            />
          }
          label={<Typography color="black">Include Lunch</Typography>}
        />

        {Boolean(formData.lunch) && (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-around" gap="20px">
              <TextField
                fullWidth
                type="number"
                label="Protein"
                id="lunch.protein"
                {...register('lunch.protein', {
                  required: true,
                  min: 0,
                })}
              />

              <TextField
                fullWidth
                type="number"
                label="Carbohydrates"
                id="lunch.carbohydrates"
                {...register('lunch.carbohydrates', {
                  required: true,
                  min: 0,
                })}
              />

              <TextField
                fullWidth
                type="number"
                label="Fats"
                id="lunch.fats"
                {...register('lunch.fats', {
                  required: true,
                  min: 0,
                })}
              />

              <TextField
                fullWidth
                type="number"
                label="Calories"
                id="lunch.calories"
                {...register('lunch.calories', {
                  required: true,
                  min: 0,
                })}
              />
            </Box>
            <Box width="80%">
              <RecipesAutocomplete
                id="lunch.recipes"
                currentRecipes={(formData.lunch?.recipes as Recipe[]) ?? []}
                setValue={setValue}
              />
            </Box>
            <Divider sx={{ margin: '5px' }} />
            <Box
              justifyContent="space-around"
              alignItems="center"
              display="flex"
              gap="20px"
              sx={{ flexWrap: 'wrap', width: '100%' }}
            >
              {formData.lunch?.recipes?.map((x) => (
                <SimpleRecipeCard
                  id="lunch.recipes"
                  currentRecipes={(formData.lunch?.recipes as Recipe[]) ?? []}
                  setValue={setValue}
                  setOpenDetails={setOpenDetails}
                  setSelectedRecipe={setSelectedRecipe}
                  key={`${x.Id}-${x.name}`}
                  item={x as Recipe}
                />
              ))}
            </Box>
          </>
        )}
      </Box>

      <Box display="flex" flexDirection="column" alignItems="center" gap="20px">
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(formData.dinner)}
              onChange={() => {
                if (formData.dinner) {
                  setValue('dinner', undefined);
                } else {
                  setValue('dinner', {
                    calories: 0,
                    protein: 0,
                    carbohydrates: 0,
                    fats: 0,
                    recipes: [],
                  });
                }
              }}
            />
          }
          label={<Typography color="black">Include Dinner</Typography>}
        />

        {Boolean(formData.dinner) && (
          <>
            <Box display="flex" alignItems="center" justifyContent="space-around" gap="20px">
              <TextField
                fullWidth
                type="number"
                label="Protein"
                id="dinner.protein"
                {...register('dinner.protein', {
                  required: true,
                  min: 0,
                })}
              />

              <TextField
                fullWidth
                type="number"
                label="Carbohydrates"
                id="dinner.carbohydrates"
                {...register('dinner.carbohydrates', {
                  required: true,
                  min: 0,
                })}
              />

              <TextField
                fullWidth
                type="number"
                label="Fats"
                id="dinner.fats"
                {...register('dinner.fats', {
                  required: true,
                  min: 0,
                })}
              />

              <TextField
                fullWidth
                type="number"
                label="Calories"
                id="dinner.calories"
                {...register('dinner.calories', {
                  required: true,
                  min: 0,
                })}
              />
            </Box>
            <Box width="80%">
              <RecipesAutocomplete
                id="dinner.recipes"
                currentRecipes={(formData.dinner?.recipes as Recipe[]) ?? []}
                setValue={setValue}
              />
            </Box>
            <Divider sx={{ margin: '5px' }} />
            <Box
              justifyContent="space-around"
              alignItems="center"
              display="flex"
              gap="20px"
              sx={{ flexWrap: 'wrap', width: '100%' }}
            >
              {formData.dinner?.recipes?.map((x) => (
                <SimpleRecipeCard
                  id="dinner.recipes"
                  currentRecipes={(formData.dinner?.recipes as Recipe[]) ?? []}
                  setValue={setValue}
                  setOpenDetails={setOpenDetails}
                  setSelectedRecipe={setSelectedRecipe}
                  key={`${x.Id}-${x.name}`}
                  item={x as Recipe}
                />
              ))}
            </Box>
          </>
        )}
      </Box>

      <Box width="60%" display="flex" alignItems="center" gap="20px" justifyContent="space-between">
        <Button
          sx={{ width: '150px' }}
          variant="contained"
          onClick={() => {
            reset();
          }}
        >
          Clear All
        </Button>
        <Button
          onClick={() => {
            submitData(formData as DailyPlanFormData);
          }}
          variant="contained"
          disabled={
            !formState.isValid ||
            disableBtn ||
            (formData.breakfast === undefined &&
              formData.lunch === undefined &&
              formData.dinner === undefined) ||
            (formData.breakfast?.recipes?.length === 0 &&
              formData.lunch?.recipes?.length === 0 &&
              formData.dinner?.recipes?.length === 0)
          }
        >
          Save
        </Button>
      </Box>

      <RecipeDetails open={openDetails} setOpen={setOpenDetails} item={selectedRecipe} />
    </Box>
  );
};
