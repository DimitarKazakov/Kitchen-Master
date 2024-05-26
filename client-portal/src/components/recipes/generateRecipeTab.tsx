import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import { Box, Button, CircularProgress, Divider, TextField } from '@mui/material';

import { useGetClientUser } from '../../api/clientUserController';
import { Recipe } from '../../api/entities';
import { generateCustomRecipe, generateRecipe } from '../../api/generateController';
import { GenerateQuickRecipe } from './GenerateQuickRecipe';
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
            sx={{ flexWrap: 'wrap', marginTop: '50px', marginBottom: '50px' }}
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
              sx={{ padding: '10px', height: '50px', width: '250px' }}
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
            sx={{ flexWrap: 'wrap', marginTop: '50px', marginBottom: '50px' }}
            display="flex"
            gap="50px"
            alignItems="center"
            justifyContent="space-around"
          >
            <GenerateQuickRecipe
              label="Quick breakfast"
              input="Give me a quick and delicious cooking breakfast recipe that i can make under 30 minutes with not much ingredients"
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedTab={setSelectedTab}
            />

            <GenerateQuickRecipe
              label="Quick lunch"
              input="Give me a quick and delicious lunch cooking recipe that i can make under 30 minutes with not much ingredients"
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedTab={setSelectedTab}
            />

            <GenerateQuickRecipe
              label="Quick dinner"
              input="Give me a quick and delicious dinner cooking recipe that i can make under 30 minutes with not much ingredients"
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedTab={setSelectedTab}
            />

            <GenerateQuickRecipe
              label="Cocktail recipe"
              input="Give me a good cocktail recipe i can drink and feel good."
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedTab={setSelectedTab}
            />

            <GenerateQuickRecipe
              label="Refreshing Drink"
              input="Give me a good beverage recipe i can drink and feel refreshed after it."
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedTab={setSelectedTab}
            />

            <GenerateQuickRecipe
              label="Dessert"
              input="Give me a cooking recipe for a good and quick to make dessert that doesn't have so much calories."
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedTab={setSelectedTab}
            />

            <GenerateQuickRecipe
              label="Salad"
              input="Give me a salad recipe that i can make quick and the salad should be healthy and light."
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedTab={setSelectedTab}
            />

            <GenerateQuickRecipe
              label="Fast Food"
              input="Give me a cooking recipe suggestion for fast food that i can make or order quick like pizza, burger, pasta, mexican, indian or other suggestions."
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedRecipe={setSelectedRecipe}
              setSelectedTab={setSelectedTab}
            />
          </Box>

          <Divider />
          <Box
            sx={{ flexWrap: 'wrap', marginTop: '50px', marginBottom: '50px' }}
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
              sx={{ padding: '10px', height: '50px', width: '250px' }}
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
