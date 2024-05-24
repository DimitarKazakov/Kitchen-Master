import { Dispatch, SetStateAction } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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

type RecipeCardProps = {
  item: Recipe;

  setOpenDetails: Dispatch<SetStateAction<boolean>>;
  setOpenDelete: Dispatch<SetStateAction<boolean>>;
  setSelectedRecipe: Dispatch<SetStateAction<Recipe | undefined>>;
  setSelectedTab: Dispatch<SetStateAction<number>>;
  setIsGenerated: Dispatch<SetStateAction<boolean>>;
};

export const RecipeCard = (props: RecipeCardProps) => {
  const { item, setOpenDetails, setSelectedRecipe, setOpenDelete, setIsGenerated, setSelectedTab } =
    props;

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
          onClick={() => {
            setSelectedRecipe(item);
            setOpenDetails(true);
          }}
          aria-label="view details"
        >
          <MenuBookIcon />
        </IconButton>

        <IconButton
          onClick={() => {
            setSelectedRecipe(item);
            setSelectedTab(1);
            setIsGenerated(false);
          }}
          aria-label="edit"
        >
          <EditIcon />
        </IconButton>

        <IconButton
          onClick={() => {
            setSelectedRecipe(item);
            setOpenDelete(true);
          }}
          aria-label="delete"
        >
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};
