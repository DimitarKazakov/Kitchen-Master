import { Dispatch, SetStateAction } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { Recipe } from '../../api/entities';
import { useDeleteRecipeMutation } from '../../api/recipeController';

type DeleteRecipeProps = {
  item: Recipe | undefined;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const DeleteRecipe = (props: DeleteRecipeProps) => {
  const { item, open, setOpen } = props;

  const deleteRecipeMutation = useDeleteRecipeMutation();

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
    >
      <DialogTitle id="alert-dialog-title">Delete Recipe</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete: {item?.name}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpen(false);
          }}
        >
          Close
        </Button>
        <Button
          sx={{ color: 'red' }}
          onClick={() => {
            deleteRecipeMutation.mutateAsync(item?.Id ?? '').then(() => {
              setOpen(false);
            });
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
