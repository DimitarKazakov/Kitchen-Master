import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import { Box, Button, CircularProgress, Divider, TextField } from '@mui/material';

import { useGetClientUser } from '../../api/clientUserController';
import { Recipe } from '../../api/entities';
import { generateCustomRecipe, generateRecipe } from '../../api/generateController';
import { IngredientsSelect } from './IngredientsSelect';

type GenerateRecipeTabProps = {
  setSelectedTab: Dispatch<SetStateAction<number>>;
  setSelectedRecipe: Dispatch<SetStateAction<Recipe | undefined>>;
  setIsGenerated: Dispatch<SetStateAction<boolean>>;
};

export const GenerateRecipeTab = (props: GenerateRecipeTabProps) => {
  const { setSelectedTab, setIsGenerated, setSelectedRecipe } = props;
  const { data: clientUser } = useGetClientUser();
  const [generateBtnLoading, setGenerateBtnLoading] = useState(false);

  const [includeIngredients, setIncludeIngredients] = useState<string[]>([]);
  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>('');

  useEffect(() => {
    if (clientUser?.subscription === 'FREE') {
      setSelectedTab(0);
    }
  }, [clientUser]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{ margin: '10px', width: '98%', height: '70%', minHeight: '500px' }}
      gap="20px"
    >
      {generateBtnLoading ? (
        <Box
          display="flex"
          flexDirection="column"
          width="90%"
          height="500px"
          marginLeft="50px"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress></CircularProgress>
        </Box>
      ) : (
        <>
          <Box
            sx={{ marginTop: '50px', marginBottom: '50px' }}
            display="flex"
            gap="30px"
            alignItems="center"
            justifyContent="space-around"
          >
            <IngredientsSelect
              title="Include Ingredients"
              selectedIngredients={includeIngredients}
              setSelectedIngredients={setIncludeIngredients}
            />

            <IngredientsSelect
              title="Exclude Ingredients"
              selectedIngredients={excludeIngredients}
              setSelectedIngredients={setExcludeIngredients}
            />

            <Button
              sx={{ padding: '10px', height: '50px' }}
              disabled={
                generateBtnLoading ||
                clientUser?.subscription === 'FREE' ||
                (includeIngredients.length === 0 && excludeIngredients.length === 0)
              }
              variant="contained"
              onClick={() => {
                setGenerateBtnLoading(true);
                generateRecipe({ include: includeIngredients, exclude: excludeIngredients })
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
              Generate Recipe
            </Button>
          </Box>
          <Divider />
          <Box
            sx={{ marginTop: '50px', marginBottom: '50px' }}
            display="flex"
            gap="50px"
            alignItems="center"
            justifyContent="space-around"
          >
            <TextField
              sx={{ width: '600px' }}
              multiline
              rows={6}
              label="Custom Input"
              onChange={(e) => {
                setUserInput(e.target.value);
              }}
              placeholder="Please be as descriptive as possible and give clear instructions in either English or Bulgarian"
            />

            <Button
              sx={{ padding: '10px', height: '50px' }}
              disabled={
                generateBtnLoading || clientUser?.subscription === 'FREE' || userInput.length === 0
              }
              variant="contained"
              onClick={() => {
                setGenerateBtnLoading(true);
                generateCustomRecipe({ userInput: userInput })
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
              Generate Recipe
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};
