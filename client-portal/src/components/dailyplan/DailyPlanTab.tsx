import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { Box, CircularProgress, Divider, TextField, Typography } from '@mui/material';

import { useDeleteDailyPlanMutation, useGetDailyPlans } from '../../api/dailyPlanController';
import { DailyPlan, Recipe } from '../../api/entities';
import { RecipeDetails } from '../recipes/RecipeDetails';
import { DailyPlanExpand } from './DailyPlanExpand';

type DailyPlanTabProps = {
  setSelectedTab: Dispatch<SetStateAction<number>>;
  setSelectedDailyPlan: Dispatch<SetStateAction<DailyPlan | undefined>>;
  setIsGenerated: Dispatch<SetStateAction<boolean>>;
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

export const DailyPlanTab = (props: DailyPlanTabProps) => {
  const { setSelectedTab, setSelectedDailyPlan, setIsGenerated } = props;
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [currentDailyPlans, setCurrentDailyPlans] = useState<DailyPlan[]>([]);
  const [openDetails, setOpenDetails] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(undefined);

  const { data: dailyPlans, isLoading } = useGetDailyPlans();

  useEffect(() => {
    if (dailyPlans) {
      if (currentSearch) {
        setCurrentDailyPlans(
          dailyPlans.filter((x) => x.name.toLowerCase().includes(currentSearch.toLowerCase())),
        );
      } else {
        setCurrentDailyPlans(dailyPlans);
      }
    }
  }, [dailyPlans, currentSearch]);

  const deleteDailyPlansMutation = useDeleteDailyPlanMutation();

  return (
    <Box display="flex" flexDirection="column" sx={{ margin: '10px', width: '98%' }} gap="20px">
      <Box display="flex" sx={{ width: '100%' }} alignItems="center" justifyContent="space-around">
        <TextField
          disabled={isLoading}
          id="searchRecipe"
          label="Search for your daily plan"
          variant="filled"
          sx={{ width: '78%' }}
          onChange={(e) => setCurrentSearch(e.target.value)}
        />
      </Box>

      {isLoading ? (
        <Box display="flex" width="90%" height="90%" justifyContent="center" alignItems="center">
          <CircularProgress></CircularProgress>
        </Box>
      ) : (
        <>
          <Box
            justifyContent="space-around"
            alignItems="center"
            display="flex"
            flexDirection="column"
            gap="20px"
            sx={{ flexWrap: 'wrap', width: '100%' }}
          >
            <Box display="flex" gap="20px" alignItems="center">
              <Typography sx={{ color: 'black' }}>Monday</Typography>
              {currentDailyPlans.filter((x) => x.day === 'Monday').length === 0 && (
                <Typography sx={{ color: 'black' }} variant="subtitle2">
                  No data for this day
                </Typography>
              )}
            </Box>

            {currentDailyPlans
              .filter((x) => x.day === 'Monday')
              ?.map((x) => (
                <DailyPlanExpand
                  key={x.Id}
                  dailyPlan={x}
                  setIsGenerated={setIsGenerated}
                  setOpenDetails={setOpenDetails}
                  setSelectedDailyPlan={setSelectedDailyPlan}
                  setSelectedRecipe={setSelectedRecipe}
                  setSelectedTab={setSelectedTab}
                />
              ))}
            <Divider />

            <Box display="flex" gap="20px" alignItems="center">
              <Typography sx={{ color: 'black' }}>Tuesday</Typography>
              {currentDailyPlans.filter((x) => x.day === 'Tuesday').length === 0 && (
                <Typography sx={{ color: 'black' }} variant="subtitle2">
                  No data for this day
                </Typography>
              )}
            </Box>

            {currentDailyPlans
              .filter((x) => x.day === 'Tuesday')
              ?.map((x) => (
                <DailyPlanExpand
                  key={x.Id}
                  dailyPlan={x}
                  setIsGenerated={setIsGenerated}
                  setOpenDetails={setOpenDetails}
                  setSelectedDailyPlan={setSelectedDailyPlan}
                  setSelectedRecipe={setSelectedRecipe}
                  setSelectedTab={setSelectedTab}
                />
              ))}
            <Divider />

            <Box display="flex" gap="20px" alignItems="center">
              <Typography sx={{ color: 'black' }}>Wednesday</Typography>
              {currentDailyPlans.filter((x) => x.day === 'Wednesday').length === 0 && (
                <Typography sx={{ color: 'black' }} variant="subtitle2">
                  No data for this day
                </Typography>
              )}
            </Box>
            {currentDailyPlans
              .filter((x) => x.day === 'Wednesday')
              ?.map((x) => (
                <DailyPlanExpand
                  key={x.Id}
                  dailyPlan={x}
                  setIsGenerated={setIsGenerated}
                  setOpenDetails={setOpenDetails}
                  setSelectedDailyPlan={setSelectedDailyPlan}
                  setSelectedRecipe={setSelectedRecipe}
                  setSelectedTab={setSelectedTab}
                />
              ))}
            <Divider />

            <Box display="flex" gap="20px" alignItems="center">
              <Typography sx={{ color: 'black' }}>Thursday</Typography>
              {currentDailyPlans.filter((x) => x.day === 'Thursday').length === 0 && (
                <Typography sx={{ color: 'black' }} variant="subtitle2">
                  No data for this day
                </Typography>
              )}
            </Box>
            {currentDailyPlans
              .filter((x) => x.day === 'Thursday')
              ?.map((x) => (
                <DailyPlanExpand
                  key={x.Id}
                  dailyPlan={x}
                  setIsGenerated={setIsGenerated}
                  setOpenDetails={setOpenDetails}
                  setSelectedDailyPlan={setSelectedDailyPlan}
                  setSelectedRecipe={setSelectedRecipe}
                  setSelectedTab={setSelectedTab}
                />
              ))}
            <Divider />

            <Box display="flex" gap="20px" alignItems="center">
              <Typography sx={{ color: 'black' }}>Friday</Typography>
              {currentDailyPlans.filter((x) => x.day === 'Friday').length === 0 && (
                <Typography sx={{ color: 'black' }} variant="subtitle2">
                  No data for this day
                </Typography>
              )}
            </Box>
            {currentDailyPlans
              .filter((x) => x.day === 'Friday')
              ?.map((x) => (
                <DailyPlanExpand
                  key={x.Id}
                  dailyPlan={x}
                  setIsGenerated={setIsGenerated}
                  setOpenDetails={setOpenDetails}
                  setSelectedDailyPlan={setSelectedDailyPlan}
                  setSelectedRecipe={setSelectedRecipe}
                  setSelectedTab={setSelectedTab}
                />
              ))}
            <Divider />

            <Box display="flex" gap="20px" alignItems="center">
              <Typography sx={{ color: 'black' }}>Saturday</Typography>
              {currentDailyPlans.filter((x) => x.day === 'Saturday').length === 0 && (
                <Typography sx={{ color: 'black' }} variant="subtitle2">
                  No data for this day
                </Typography>
              )}
            </Box>
            {currentDailyPlans
              .filter((x) => x.day === 'Saturday')
              ?.map((x) => (
                <DailyPlanExpand
                  key={x.Id}
                  dailyPlan={x}
                  setIsGenerated={setIsGenerated}
                  setOpenDetails={setOpenDetails}
                  setSelectedDailyPlan={setSelectedDailyPlan}
                  setSelectedRecipe={setSelectedRecipe}
                  setSelectedTab={setSelectedTab}
                />
              ))}
            <Divider />

            <Box display="flex" gap="20px" alignItems="center">
              <Typography sx={{ color: 'black' }}>Sunday</Typography>
              {currentDailyPlans.filter((x) => x.day === 'Sunday').length === 0 && (
                <Typography sx={{ color: 'black' }} variant="subtitle2">
                  No data for this day
                </Typography>
              )}
            </Box>
            {currentDailyPlans
              .filter((x) => x.day === 'Sunday')
              ?.map((x) => (
                <DailyPlanExpand
                  key={x.Id}
                  dailyPlan={x}
                  setIsGenerated={setIsGenerated}
                  setOpenDetails={setOpenDetails}
                  setSelectedDailyPlan={setSelectedDailyPlan}
                  setSelectedRecipe={setSelectedRecipe}
                  setSelectedTab={setSelectedTab}
                />
              ))}
          </Box>
        </>
      )}

      <RecipeDetails open={openDetails} setOpen={setOpenDetails} item={selectedRecipe} />
    </Box>
  );
};
