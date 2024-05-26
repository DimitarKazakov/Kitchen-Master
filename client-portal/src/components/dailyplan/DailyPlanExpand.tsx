import { Dispatch, SetStateAction } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
} from '@mui/material';

import { useDeleteDailyPlanMutation } from '../../api/dailyPlanController';
import { DailyPlan, Recipe } from '../../api/entities';
import { MealPlanExpand } from './MealPlanExpand';

type DailyPlanExpandProps = {
  dailyPlan: DailyPlan;
  setSelectedTab: Dispatch<SetStateAction<number>>;
  setSelectedDailyPlan: Dispatch<SetStateAction<DailyPlan | undefined>>;
  setIsGenerated: Dispatch<SetStateAction<boolean>>;
  setSelectedRecipe: Dispatch<SetStateAction<Recipe | undefined>>;
  setOpenDetails: Dispatch<SetStateAction<boolean>>;
};

const getAllCalories = (plan: DailyPlan) => {
  let allCalories = 0;
  allCalories += plan.breakfast?.calories ?? 0;
  allCalories += plan.lunch?.calories ?? 0;
  allCalories += plan.dinner?.calories ?? 0;
  return allCalories;
};

const getAllProtein = (plan: DailyPlan) => {
  let allProtein = 0;
  allProtein += plan.breakfast?.protein ?? 0;
  allProtein += plan.lunch?.protein ?? 0;
  allProtein += plan.dinner?.protein ?? 0;
  return allProtein;
};

const getAllCarbohydrates = (plan: DailyPlan) => {
  let allCarbohydrates = 0;
  allCarbohydrates += plan.breakfast?.carbohydrates ?? 0;
  allCarbohydrates += plan.lunch?.carbohydrates ?? 0;
  allCarbohydrates += plan.dinner?.carbohydrates ?? 0;
  return allCarbohydrates;
};

const getAllFats = (plan: DailyPlan) => {
  let allFats = 0;
  allFats += plan.breakfast?.fats ?? 0;
  allFats += plan.lunch?.fats ?? 0;
  allFats += plan.dinner?.fats ?? 0;
  return allFats;
};

export const DailyPlanExpand = (props: DailyPlanExpandProps) => {
  const {
    dailyPlan,
    setSelectedDailyPlan,
    setIsGenerated,
    setSelectedTab,
    setSelectedRecipe,
    setOpenDetails,
  } = props;

  const deleteDailyPlansMutation = useDeleteDailyPlanMutation();

  return (
    <Accordion sx={{ width: '78%' }} key={dailyPlan.Id}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel3-content"
        id="panel3-header"
      >
        {`${dailyPlan.name} - ${dailyPlan.day}. Calories: ${getAllCalories(
          dailyPlan,
        )}kcal. Protein ${getAllProtein(dailyPlan)}g. Carbohydrates: ${getAllCarbohydrates(
          dailyPlan,
        )}g. Fats ${getAllFats(dailyPlan)}g.`}
      </AccordionSummary>

      <AccordionDetails>
        <>
          {dailyPlan.breakfast !== undefined && (
            <MealPlanExpand
              id={dailyPlan.Id}
              label="Breakfast"
              mealPlan={dailyPlan.breakfast}
              setOpenDetails={setOpenDetails}
              setSelectedRecipe={setSelectedRecipe}
            />
          )}

          {dailyPlan.lunch !== undefined && (
            <MealPlanExpand
              id={dailyPlan.Id}
              label="Lunch"
              mealPlan={dailyPlan.lunch}
              setOpenDetails={setOpenDetails}
              setSelectedRecipe={setSelectedRecipe}
            />
          )}

          {dailyPlan.dinner !== undefined && (
            <MealPlanExpand
              id={dailyPlan.Id}
              label="Dinner"
              mealPlan={dailyPlan.dinner}
              setOpenDetails={setOpenDetails}
              setSelectedRecipe={setSelectedRecipe}
            />
          )}
        </>
      </AccordionDetails>

      <AccordionActions>
        <Button
          startIcon={<DeleteIcon />}
          sx={{ color: 'red' }}
          onClick={() => {
            setSelectedDailyPlan(undefined);
            setIsGenerated(false);
            deleteDailyPlansMutation.mutate(dailyPlan.Id);
          }}
        >
          Delete
        </Button>
        <Button
          startIcon={<EditIcon />}
          onClick={() => {
            setSelectedDailyPlan(dailyPlan);
            setSelectedTab(1);
            setIsGenerated(false);
          }}
        >
          Update
        </Button>
      </AccordionActions>
    </Accordion>
  );
};
