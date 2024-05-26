import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Box, Button, Divider, TextField } from '@mui/material';

import { Menu, MenuStoreRequest, Recipe } from '../../api/entities';
import { usePostMenuMutation, usePutMenuMutation } from '../../api/menuController';
import { RecipeDetails } from '../recipes/RecipeDetails';
import { RecipesAutocomplete } from './RecipesAutocomplete';
import { SimpleRecipeCard } from './SimpleRecipeCard';

type AddMenuTabProps = {
  isGenerated: boolean;
  selectedMenu: Menu | undefined;
  setSelectedTab: Dispatch<SetStateAction<number>>;
};

export type MenuFormData = {
  name: string;
  event: string;
  recipes: Recipe[];
};

export const AddMenuTab = (props: AddMenuTabProps) => {
  const { isGenerated, selectedMenu, setSelectedTab } = props;

  const [openDetails, setOpenDetails] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(undefined);
  const [disableBtn, setDisableBtn] = useState(false);

  const { control, register, formState, reset, setValue, trigger } = useForm<MenuFormData>({
    mode: 'onChange',
    defaultValues: {
      name: selectedMenu?.name ?? '',
      event: selectedMenu?.event ?? '',
      recipes: selectedMenu?.recipes ?? [],
    },
  });

  useEffect(() => {
    trigger();
  }, []);

  const formData = useWatch({ control: control });

  const createMenuMutation = usePostMenuMutation();
  const updateMenuMutation = usePutMenuMutation();

  const submitData = (data: MenuFormData) => {
    const request: MenuStoreRequest = {
      name: data.name.replaceAll('"', '').trim(),
      event: data.event.replaceAll('"', '').trim(),
      recipes: data.recipes,
    };

    setDisableBtn(true);

    if (selectedMenu && !isGenerated) {
      updateMenuMutation.mutateAsync({ menuId: selectedMenu.Id, data: request }).then(() => {
        setDisableBtn(false);
        setSelectedTab(0);
        reset();
      });
    } else {
      createMenuMutation.mutateAsync({ data: request, createRecipes: isGenerated }).then(() => {
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
        <TextField
          fullWidth
          label="Event"
          id="event"
          {...register('event', {
            required: true,
          })}
        />
      </Box>

      <Box width="80%">
        <RecipesAutocomplete
          id="recipes"
          currentRecipes={(formData.recipes as Recipe[]) ?? []}
          setValue={setValue}
        />
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
            submitData(formData as MenuFormData);
          }}
          variant="contained"
          disabled={!formState.isValid || disableBtn || formData.recipes?.length === 0}
        >
          Save
        </Button>
      </Box>

      <Divider sx={{ margin: '5px' }} />

      <Box
        justifyContent="space-around"
        alignItems="center"
        display="flex"
        gap="20px"
        sx={{ flexWrap: 'wrap', width: '100%' }}
      >
        {formData.recipes?.map((x) => (
          <SimpleRecipeCard
            currentRecipes={(formData.recipes as Recipe[]) ?? []}
            setValue={setValue}
            setOpenDetails={setOpenDetails}
            setSelectedRecipe={setSelectedRecipe}
            key={`${x.Id}-${x.name}`}
            item={x as Recipe}
            id="recipes"
          />
        ))}
      </Box>

      <RecipeDetails open={openDetails} setOpen={setOpenDetails} item={selectedRecipe} />
    </Box>
  );
};
