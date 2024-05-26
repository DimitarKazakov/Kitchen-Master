import { Dispatch, SetStateAction } from 'react';
import { UseFormSetValue } from 'react-hook-form';

import DeleteIcon from '@mui/icons-material/Delete';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography,
} from '@mui/material';

import { Recipe } from '../../api/entities';

type SimpleRecipeCardProps = {
  item: Recipe;
  id: string;
  currentRecipes?: Recipe[];
  setValue?: UseFormSetValue<any>;
  setOpenDetails: Dispatch<SetStateAction<boolean>>;
  setSelectedRecipe: Dispatch<SetStateAction<Recipe | undefined>>;
};

export const SimpleRecipeCard = (props: SimpleRecipeCardProps) => {
  const { item, id, currentRecipes, setValue, setOpenDetails, setSelectedRecipe } = props;

  return (
    <Card sx={{ width: '400px' }}>
      <CardHeader title={item.name} />
      <CardMedia component="img" height="194" image={item.imageUrl} alt="recipe image" />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {item.description.replaceAll('"', '')}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton
          sx={{ color: 'green' }}
          onClick={() => {
            setSelectedRecipe(item);
            setOpenDetails(true);
          }}
          aria-label="view details"
        >
          <MenuBookIcon />
        </IconButton>

        {currentRecipes && setValue && (
          <IconButton
            sx={{ color: 'red' }}
            onClick={() => {
              const recipes = currentRecipes.filter((x) => x.name !== item.name);
              setValue(id, recipes, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
};
