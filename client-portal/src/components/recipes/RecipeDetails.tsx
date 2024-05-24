import { Dispatch, SetStateAction } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
} from '@mui/material';

import { Recipe } from '../../api/entities';

type RecipeDetailsProps = {
  item: Recipe | undefined;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const RecipeDetails = (props: RecipeDetailsProps) => {
  const { item, open, setOpen } = props;
  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <DialogTitle id="alert-dialog-title">{item?.name ?? ''}</DialogTitle>
      <DialogContent>
        <img width={550} alt="recipe image" src={item?.imageUrl ?? ''} />

        <DialogContentText>Preparation time: {item?.preparationTime}</DialogContentText>
        <DialogContentText>Cooking time: {item?.cookingTime}</DialogContentText>
        <DialogContentText>All time: {item?.allTime}</DialogContentText>
        <DialogContentText>Portions: {item?.portions}</DialogContentText>

        <Divider sx={{ margin: '5px' }} />

        <DialogContentText id="alert-dialog-description">
          {item?.description.replaceAll('"', '') ?? ''}
        </DialogContentText>
        <Divider sx={{ margin: '5px' }} />

        {item?.notes && (
          <>
            <DialogContentText id="alert-dialog-description">{item.notes}</DialogContentText>
            <Divider sx={{ margin: '5px' }} />
          </>
        )}

        <DialogContentText sx={{ fontWeight: 600 }}>Ingredients:</DialogContentText>
        {item?.ingredients.map((x, i) => (
          <DialogContentText key={x}>
            {i + 1}. {x}
          </DialogContentText>
        ))}
        <Divider sx={{ margin: '5px' }} />

        <DialogContentText sx={{ fontWeight: 600 }}>Instructions:</DialogContentText>
        {item?.instructions.map((x, i) => (
          <DialogContentText key={x}>
            {i + 1}. {x}
          </DialogContentText>
        ))}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpen(false);
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
