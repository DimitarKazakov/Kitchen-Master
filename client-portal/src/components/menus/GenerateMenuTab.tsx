import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import LockIcon from '@mui/icons-material/Lock';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';

import { useGetClientUser } from '../../api/clientUserController';
import { Menu } from '../../api/entities';
import { generateCustomMenu, generateMenu } from '../../api/generateController';
import { IngredientsSelect } from '../recipes/IngredientsSelect';
import { GenerateQuickMenu } from './GenerateQuickMenu';

type FormData = {
  event: string;
  numberOfPeople: number;
  numberOfCourses: number;
  includeDrinks: boolean;
  includeCocktails: boolean;
  excludeDessert: boolean;
};

type GenerateMenuTabProps = {
  setSelectedTab: Dispatch<SetStateAction<number>>;
  setIsGenerated: Dispatch<SetStateAction<boolean>>;
  setSelectedMenu: Dispatch<SetStateAction<Menu | undefined>>;
};

export const GenerateMenuTab = (props: GenerateMenuTabProps) => {
  const { setSelectedTab, setIsGenerated, setSelectedMenu } = props;
  const { data: clientUser } = useGetClientUser();
  const [generateBtnLoading, setGenerateBtnLoading] = useState(false);

  const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>('');

  const { control, register, formState, reset, setValue, trigger } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      event: '',
      numberOfPeople: 2,
      numberOfCourses: 3,
      includeDrinks: false,
      includeCocktails: false,
      excludeDessert: false,
    },
  });

  useEffect(() => {
    trigger();
  }, []);

  const formData = useWatch({ control: control });

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
            sx={{
              flexWrap: 'wrap',
              marginTop: '50px',
              marginBottom: '50px',
              marginLeft: 'auto',
              marginRight: 'auto',
              width: '80%',
            }}
            display="flex"
            gap="30px"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" flexDirection="column" gap="20px" width="50%">
              <Box display="flex" alignItems="center" justifyContent="space-around" gap="20px">
                <TextField
                  fullWidth
                  label="Event"
                  id="event"
                  {...register('event', {
                    required: true,
                  })}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Number of people"
                  id="numberOfPeople"
                  {...register('numberOfPeople', {
                    required: true,
                  })}
                />
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-around" gap="20px">
                <TextField
                  fullWidth
                  type="number"
                  label="Number of courses"
                  id="numberOfCourses"
                  {...register('numberOfCourses', {
                    required: true,
                  })}
                />

                <IngredientsSelect
                  title="Exclude Ingredients"
                  selectedIngredients={excludeIngredients}
                  setSelectedIngredients={setExcludeIngredients}
                />
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-around">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includeDrinks}
                      onChange={() => {
                        setValue('includeDrinks', !formData.includeDrinks);
                      }}
                    />
                  }
                  label={<Typography color="black">Include Drinks</Typography>}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includeCocktails}
                      onChange={() => {
                        setValue('includeCocktails', !formData.includeCocktails);
                      }}
                    />
                  }
                  label={<Typography color="black">Include Cocktails</Typography>}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.excludeDessert}
                      onChange={() => {
                        setValue('excludeDessert', !formData.excludeDessert);
                      }}
                    />
                  }
                  label={<Typography color="black">Exclude Dessert</Typography>}
                />
              </Box>
            </Box>

            <Button
              sx={{ padding: '10px', height: '50px', width: '250px' }}
              disabled={
                generateBtnLoading || clientUser?.subscription === 'FREE' || !formState.isValid
              }
              variant="contained"
              onClick={() => {
                setGenerateBtnLoading(true);
                generateMenu({
                  event: formData.event ?? '',
                  numberOfPeople: Number.parseInt(formData.numberOfPeople?.toString() ?? '') || 2,
                  numberOfCourses: Number.parseInt(formData.numberOfCourses?.toString() ?? '') ?? 3,
                  includeDrinks: formData.includeDrinks ?? false,
                  includeCocktails: formData.includeCocktails ?? false,
                  excludeDessert: formData.excludeDessert ?? false,
                  exclude: excludeIngredients,
                })
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
              Generate Menu
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
            <GenerateQuickMenu
              label="Romantic Dinner for two"
              input="Give me a suggestion for 3 course menu for romantic dinner for two people. Include drinks as well and the meals should be light. Give me the cooking recipes for them"
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedMenu={setSelectedMenu}
              setSelectedTab={setSelectedTab}
            />

            <GenerateQuickMenu
              label="Birthday party"
              input="Give me a suggestion for 3 course menu for birthday party for 8 people. Include alcoholic and non alcoholic beverages as well. It should have a birthday cake or dessert of some kind. Give me the cooking recipes for them."
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedMenu={setSelectedMenu}
              setSelectedTab={setSelectedTab}
            />

            <GenerateQuickMenu
              label="Barbecue with friends"
              input="Give me a suggestion for a menu for barbecue party with 6 friends. Of course we should include meat or burgers of some kind and beer to drink. Give me the cooking recipes for them."
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedMenu={setSelectedMenu}
              setSelectedTab={setSelectedTab}
            />

            <GenerateQuickMenu
              label="Camping trip"
              input="Give me a suggestion for camping trip menu for 4 people enough to last 2 days. Don't include things that can easily spoil and we prefer to have things that are done or easily cooked over a camp fire. Give me the cooking recipes for them."
              generateBtnLoading={generateBtnLoading}
              setGenerateBtnLoading={setGenerateBtnLoading}
              setIsGenerated={setIsGenerated}
              setSelectedMenu={setSelectedMenu}
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
                generateCustomMenu({ userInput: userInput })
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
              Generate Menu
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};
