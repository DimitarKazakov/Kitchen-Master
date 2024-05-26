import { SetStateAction } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import { Button } from '@mui/material';

import { useGetClientUser } from '../../api/clientUserController';
import { Recipe } from '../../api/entities';
import { generateCustomRecipe } from '../../api/generateController';

type GenerateQuickRecipeProps = {
  label: string;
  input: string;
  generateBtnLoading: boolean;
  setGenerateBtnLoading: (value: SetStateAction<boolean>) => void;
  setIsGenerated: (value: SetStateAction<boolean>) => void;
  setSelectedTab: (value: SetStateAction<number>) => void;
  setSelectedRecipe: (value: SetStateAction<Recipe | undefined>) => void;
};

export const GenerateQuickRecipe = (props: GenerateQuickRecipeProps) => {
  const {
    label,
    input,
    generateBtnLoading,
    setGenerateBtnLoading,
    setIsGenerated,
    setSelectedTab,
    setSelectedRecipe,
  } = props;

  const { data: clientUser } = useGetClientUser();

  return (
    <Button
      sx={{ padding: '10px', height: '50px', width: '250px' }}
      disabled={generateBtnLoading || clientUser?.subscription === 'FREE'}
      variant="contained"
      onClick={() => {
        setGenerateBtnLoading(true);
        generateCustomRecipe({ userInput: input })
          .then((x) => {
            setGenerateBtnLoading(false);
            setIsGenerated(true);
            setSelectedRecipe({
              ...x,
              Id: '',
              notes: '',
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
