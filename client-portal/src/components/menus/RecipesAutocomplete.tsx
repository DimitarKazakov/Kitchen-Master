import { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';

import { Autocomplete, TextField } from '@mui/material';

import { Recipe } from '../../api/entities';
import { useGetRecipes } from '../../api/recipeController';
import { useDebounceValue } from '../../hooks/useDebounceValue';

type RecipesAutocompleteProps = {
  currentRecipes: Recipe[];
  setValue: UseFormSetValue<any>;
  id: string;
};

export const RecipesAutocomplete = (props: RecipesAutocompleteProps) => {
  const { currentRecipes, id, setValue } = props;

  const [currentSearch, setCurrentSearch] = useState<string>('');
  const debouncedSearch = useDebounceValue(currentSearch, 500);
  const [searchRequest, setSearchRequest] = useState('');

  useEffect(() => {
    if (debouncedSearch) {
      setSearchRequest(`${debouncedSearch}`);
    } else {
      setSearchRequest('');
    }
  }, [debouncedSearch]);

  const { data: recipes, isLoading } = useGetRecipes(searchRequest, 1, 500);

  return (
    <Autocomplete
      sx={{ width: '100%' }}
      disablePortal
      onChange={(_, value) => {
        const recipe = recipes?.recipes.find((x) => x.name === value);
        if (recipe) {
          setValue(id, [...currentRecipes, recipe], {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      }}
      id="combo-box-demo"
      loading={isLoading}
      options={recipes?.recipes.map((x) => x.name) ?? []}
      renderInput={(params) => (
        <TextField
          onChange={(e) => {
            setCurrentSearch(e.target.value);
          }}
          {...params}
          label="Recipes"
        />
      )}
    />
  );
};
