import { Dispatch, SetStateAction } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';

import { MealPlan, Recipe } from '../../api/entities';
import { SimpleRecipeCard } from '../menus/SimpleRecipeCard';

type MealPlanExpandProps = {
  id: string;
  label: string;
  mealPlan: MealPlan;
  setSelectedRecipe: Dispatch<SetStateAction<Recipe | undefined>>;
  setOpenDetails: Dispatch<SetStateAction<boolean>>;
};

export const MealPlanExpand = (props: MealPlanExpandProps) => {
  const { id, label, mealPlan, setSelectedRecipe, setOpenDetails } = props;

  return (
    <Accordion sx={{ width: '100%', marginTop: '10px' }} key={`${id}-${label}`}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel3-content"
        id="panel3-header"
      >
        {`${label}. Calories: ${mealPlan.calories}kcal. Protein ${mealPlan.protein}g. Carbohydrates: ${mealPlan.carbohydrates}g. Fats ${mealPlan.fats}g.`}
      </AccordionSummary>

      <AccordionDetails>
        <Box
          justifyContent="space-around"
          alignItems="center"
          display="flex"
          gap="20px"
          sx={{ flexWrap: 'wrap', width: '100%' }}
        >
          {mealPlan.recipes?.map((y) => (
            <SimpleRecipeCard
              id="recipes"
              setOpenDetails={setOpenDetails}
              setSelectedRecipe={setSelectedRecipe}
              key={y.Id}
              item={y as Recipe}
            />
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
