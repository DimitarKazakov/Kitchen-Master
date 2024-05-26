import { Dispatch, SetStateAction } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';

import { postMessage } from '../../api/messageController';

type MessageDialogProps = {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  isDelete: boolean;
};

export const MessageDialog = (props: MessageDialogProps) => {
  const { openModal, setOpenModal, isDelete } = props;

  return (
    <Dialog
      open={openModal}
      onClose={() => {
        setOpenModal(false);
      }}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          const content = formJson.content;
          postMessage({
            title: isDelete
              ? 'I would like to delete my profile in Kitchen Master App.'
              : 'I would like to change my FREE subscription to the PRO plan',
            content,
          });
          setOpenModal(false);
        },
      }}
    >
      <DialogTitle>{isDelete ? 'Delete Profile' : 'Change Subscription'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {isDelete
            ? 'I would like to delete my profile in Kitchen Master App.'
            : 'I would like to change my FREE subscription to the PRO plan'}
        </DialogContentText>

        <TextField
          multiline
          rows={4}
          autoFocus
          required
          margin="dense"
          id="content"
          name="content"
          label="Content"
          type="text"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpenModal(false);
          }}
        >
          Close
        </Button>
        <Button type="submit">Send</Button>
      </DialogActions>
    </Dialog>
  );
};
