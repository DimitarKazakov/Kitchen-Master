import { SetStateAction } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import { Button } from '@mui/material';

import { useGetClientUser } from '../../api/clientUserController';
import { Menu } from '../../api/entities';
import { generateCustomMenu } from '../../api/generateController';

type GenerateQuickMenuProps = {
  label: string;
  input: string;
  generateBtnLoading: boolean;
  setGenerateBtnLoading: (value: SetStateAction<boolean>) => void;
  setIsGenerated: (value: SetStateAction<boolean>) => void;
  setSelectedTab: (value: SetStateAction<number>) => void;
  setSelectedMenu: (value: SetStateAction<Menu | undefined>) => void;
};

export const GenerateQuickMenu = (props: GenerateQuickMenuProps) => {
  const {
    label,
    input,
    generateBtnLoading,
    setGenerateBtnLoading,
    setIsGenerated,
    setSelectedTab,
    setSelectedMenu,
  } = props;

  const { data: clientUser } = useGetClientUser();

  return (
    <Button
      sx={{ padding: '10px', height: '50px', width: '250px' }}
      disabled={generateBtnLoading || clientUser?.subscription === 'FREE'}
      variant="contained"
      onClick={() => {
        setGenerateBtnLoading(true);
        generateCustomMenu({ userInput: input })
          .then((x) => {
            setGenerateBtnLoading(false);
            setIsGenerated(true);
            setSelectedMenu({
              Id: '',
              userId: clientUser?.Id ?? '',
              name: '',
              event: '',
              recipes: x.menu.map((y) => {
                return {
                  ...y,
                  Id: '',
                  notes: '',
                };
              }),
            });
            setSelectedTab(1);
          })

          .catch(() => {
            setGenerateBtnLoading(false);
          });
      }}
    >
      {clientUser?.subscription === 'FREE' && <LockIcon />}
      {label}
    </Button>
  );
};
