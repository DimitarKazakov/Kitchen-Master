import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import LockIcon from '@mui/icons-material/Lock';
import { Box, Button, CircularProgress, TextField } from '@mui/material';

import { useGetClientUser } from '../../api/clientUserController';
import { Recipe, RecipeStoreRequest } from '../../api/entities';
import { generateImage } from '../../api/generateController';
import { usePostRecipeMutation, usePutRecipeMutation } from '../../api/recipeController';

type FormData = {
  name: string;
  description: string;
  imageUrl: string;
  ingredients: string;
  instructions: string;
  preparationTime: string;
  cookingTime: string;
  allTime: string;
  portions: string;
  notes: string;
};

const DEFAULT_IMAGE =
  'https://theme-assets.getbento.com/sensei/fdfcc48.sensei/assets/images/catering-item-placeholder-704x520.png';

type AddRecipeTabProps = {
  selectedRecipe: Recipe | undefined;
  setSelectedTab: Dispatch<SetStateAction<number>>;
  isGenerated: boolean;
};

export const AddRecipeTab = (props: AddRecipeTabProps) => {
  const { isGenerated, selectedRecipe, setSelectedTab } = props;

  const { control, register, formState, reset, setValue, trigger } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      name: selectedRecipe?.name ?? '',
      description: selectedRecipe?.description ?? '',
      imageUrl: selectedRecipe?.imageUrl ?? DEFAULT_IMAGE,
      ingredients: selectedRecipe?.ingredients.join('.') ?? '',
      instructions: selectedRecipe?.instructions.join('.') ?? '',
      preparationTime: selectedRecipe?.preparationTime ?? '',
      cookingTime: selectedRecipe?.cookingTime ?? '',
      allTime: selectedRecipe?.allTime ?? '',
      portions: selectedRecipe?.portions ?? '',
      notes: selectedRecipe?.notes ?? '',
    },
  });

  useEffect(() => {
    trigger();
  }, []);

  const createRecipeMutation = usePostRecipeMutation();
  const updateRecipeMutation = usePutRecipeMutation();

  const [disableBtn, setDisableBtn] = useState(false);
  const [generateBtnLoading, setGenerateBtnLoading] = useState(false);

  const submitData = (data: FormData) => {
    const request: RecipeStoreRequest = {
      name: data.name.replaceAll('"', '').trim(),
      description: data.description.replaceAll('"', '').trim(),
      imageUrl: data.imageUrl.trim() || DEFAULT_IMAGE,
      ingredients: data.ingredients
        .replaceAll('"', '')
        .trim()
        .split('.')
        .filter((x) => x.trim()),
      instructions: data.instructions
        .replaceAll('"', '')
        .trim()
        .split('.')
        .filter((x) => x.trim()),
      preparationTime: data.preparationTime.trim(),
      cookingTime: data.cookingTime.trim(),
      allTime: data.allTime.trim(),
      portions: data.portions.trim(),
      notes: data.notes.replaceAll('"', '').trim(),
    };

    setDisableBtn(true);

    if (selectedRecipe && !isGenerated) {
      updateRecipeMutation.mutateAsync({ recipeId: selectedRecipe.Id, data: request }).then(() => {
        setDisableBtn(false);
        setSelectedTab(0);
        reset();
      });
    } else {
      createRecipeMutation.mutateAsync(request).then(() => {
        setDisableBtn(false);
        setSelectedTab(0);
        reset();
      });
    }
  };

  const { data: clientUser } = useGetClientUser();
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
        label="Name"
        id="name"
        {...register('name', {
          required: true,
          minLength: 5,
          maxLength: 100,
        })}
      />
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        gap="10px"
        alignItems="center"
      >
        <img width="300px" height="250px" src={formData.imageUrl} alt="image placeholder" />

        <Box
          width="50%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          gap="50px"
        >
          <TextField
            sx={{ width: '100%' }}
            label="ImageUrl"
            id="imageUrl"
            {...register('imageUrl', {
              required: true,
            })}
          />

          <Button
            sx={{ padding: '10px' }}
            disabled={
              !Boolean(formData.name?.trim()) ||
              generateBtnLoading ||
              clientUser?.subscription === 'FREE'
            }
            variant="contained"
            onClick={() => {
              setGenerateBtnLoading(true);
              generateImage({ recipeName: formData.name?.trim() ?? '' })
                .then((x) => {
                  setValue('imageUrl', x.imageUrl);
                  setGenerateBtnLoading(false);
                })
                .catch(() => {
                  setGenerateBtnLoading(false);
                });
            }}
          >
            {generateBtnLoading && <CircularProgress />}
            {clientUser?.subscription === 'FREE' && <LockIcon />}
            Generate Image
          </Button>
        </Box>
      </Box>
      <TextField
        multiline
        rows={3}
        fullWidth
        label="Description"
        id="description"
        {...register('description', {
          required: true,
          minLength: 10,
        })}
      />

      <Box display="flex" alignItems="center" justifyContent="space-between" gap="10px">
        <TextField
          label="Preparation time"
          id="preparationTime"
          {...register('preparationTime', {
            required: true,
            minLength: 1,
            maxLength: 20,
          })}
        />
        <TextField
          label="Cooking time"
          id="cookingTime"
          {...register('cookingTime', {
            required: true,
            minLength: 1,
            maxLength: 20,
          })}
        />
        <TextField
          label="All time"
          id="allTime"
          {...register('allTime', {
            required: true,
            minLength: 1,
            maxLength: 20,
          })}
        />
        <TextField
          label="Portions"
          id="portions"
          {...register('portions', {
            required: true,
            minLength: 1,
            maxLength: 20,
          })}
        />
      </Box>

      <TextField
        multiline
        rows={3}
        fullWidth
        label="Ingredients"
        id="ingredients"
        {...register('ingredients', {
          required: true,
          minLength: 10,
        })}
      />

      <TextField
        multiline
        rows={3}
        fullWidth
        label="Instructions"
        id="instructions"
        {...register('instructions', {
          required: true,
          minLength: 10,
        })}
      />

      <TextField
        multiline
        rows={3}
        fullWidth
        label="Notes"
        id="notes"
        {...register('notes', {
          maxLength: 500,
        })}
      />

      <Box width="30%" display="flex" alignItems="center" justifyContent="space-between">
        <Button
          variant="contained"
          onClick={() => {
            reset();
            setValue('imageUrl', DEFAULT_IMAGE);
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
