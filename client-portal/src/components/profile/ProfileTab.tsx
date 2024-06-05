import { Dispatch, SetStateAction, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useRouter } from 'next/router';

import { useGetClientUser } from '../../api/clientUserController';
import { firebaseAuth } from '../../config/firebase';
import { MessageDialog } from './MessageDialog';

type ProfileTabProps = {
  setSelectedTab: Dispatch<SetStateAction<number>>;
};

export const ProfileTab = (props: ProfileTabProps) => {
  const { setSelectedTab } = props;

  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const { data: clientUser, isLoading } = useGetClientUser();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ margin: '10px', width: '98%' }}
      gap="20px"
    >
      {isLoading ? (
        <Box display="flex" width="90%" height="90%" justifyContent="center" alignItems="center">
          <CircularProgress></CircularProgress>
        </Box>
      ) : (
        <>
          <List sx={{ width: '60%' }}>
            <ListItem
              secondaryAction={
                <IconButton
                  onClick={() => {
                    setSelectedTab(1);
                  }}
                >
                  <EditIcon />
                </IconButton>
              }
            >
              <ListItemText primary="Username" secondary={clientUser?.username} />
            </ListItem>

            <ListItem>
              <ListItemText primary="Email" secondary={clientUser?.email} />
            </ListItem>

            <ListItem
              secondaryAction={
                clientUser?.subscription === 'FREE' ? (
                  <IconButton
                    onClick={() => {
                      setOpenModal(true);
                      setIsDelete(false);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                ) : undefined
              }
            >
              <ListItemText primary="Subscription" secondary={clientUser?.subscription} />
            </ListItem>

            <ListItem
              secondaryAction={
                <IconButton
                  onClick={() => {
                    setSelectedTab(1);
                  }}
                >
                  <EditIcon />
                </IconButton>
              }
            >
              <ListItemText primary="Height" secondary={`${clientUser?.height}cm`} />
            </ListItem>

            <ListItem
              secondaryAction={
                <IconButton
                  onClick={() => {
                    setSelectedTab(1);
                  }}
                >
                  <EditIcon />
                </IconButton>
              }
            >
              <ListItemText primary="Weight" secondary={`${clientUser?.weight}kg`} />
            </ListItem>

            <ListItem
              secondaryAction={
                <IconButton
                  onClick={() => {
                    setSelectedTab(1);
                  }}
                >
                  <EditIcon />
                </IconButton>
              }
            >
              <ListItemText primary="Protein" secondary={`${clientUser?.protein}g`} />
            </ListItem>

            <ListItem
              secondaryAction={
                <IconButton
                  onClick={() => {
                    setSelectedTab(1);
                  }}
                >
                  <EditIcon />
                </IconButton>
              }
            >
              <ListItemText primary="Carbohydrates" secondary={`${clientUser?.carbohydrates}g`} />
            </ListItem>

            <ListItem
              secondaryAction={
                <IconButton
                  onClick={() => {
                    setSelectedTab(1);
                  }}
                >
                  <EditIcon />
                </IconButton>
              }
            >
              <ListItemText primary="Fats" secondary={`${clientUser?.fats}g`} />
            </ListItem>

            <ListItem
              secondaryAction={
                <IconButton
                  onClick={() => {
                    setSelectedTab(1);
                  }}
                >
                  <EditIcon />
                </IconButton>
              }
            >
              <ListItemText primary="Calories" secondary={`${clientUser?.calories}kcal`} />
            </ListItem>
          </List>

          <Box
            width="30%"
            display="flex"
            alignItems="center"
            gap="20px"
            justifyContent="space-between"
          >
            <Button
              sx={{ backgroundColor: 'red' }}
              onClick={() => {
                setOpenModal(true);
                setIsDelete(true);
              }}
              variant="contained"
            >
              Delete account
            </Button>

            <Button
              sx={{ width: '150px' }}
              variant="contained"
              onClick={() => {
                firebaseAuth.signOut().then(() => {
                  router.push('/');
                });
              }}
            >
              Logout
            </Button>
          </Box>
        </>
      )}

      <MessageDialog openModal={openModal} setOpenModal={setOpenModal} isDelete={isDelete} />
    </Box>
  );
};
