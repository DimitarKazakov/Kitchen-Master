import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material';

import { Menu, Recipe } from '../../api/entities';
import { useDeleteMenuMutation, useGetMenus } from '../../api/menuController';
import { RecipeDetails } from '../recipes/RecipeDetails';
import { SimpleRecipeCard } from './SimpleRecipeCard';

type MenuTabProps = {
  setSelectedTab: Dispatch<SetStateAction<number>>;
  setSelectedMenu: Dispatch<SetStateAction<Menu | undefined>>;
  setIsGenerated: Dispatch<SetStateAction<boolean>>;
};

export const MenuTab = (props: MenuTabProps) => {
  const { setSelectedTab, setSelectedMenu, setIsGenerated } = props;
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const [currentMenus, setCurrentMenus] = useState<Menu[]>([]);
  const [openDetails, setOpenDetails] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>(undefined);

  const { data: menus, isLoading } = useGetMenus();

  useEffect(() => {
    if (menus) {
      if (currentSearch) {
        setCurrentMenus(
          menus.filter(
            (x) =>
              x.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
              x.event.toLowerCase().includes(currentSearch.toLowerCase()),
          ),
        );
      } else {
        setCurrentMenus(menus);
      }
    }
  }, [menus, currentSearch]);

  const deleteMenuMutation = useDeleteMenuMutation();

  return (
    <Box display="flex" flexDirection="column" sx={{ margin: '10px', width: '98%' }} gap="20px">
      <Box display="flex" sx={{ width: '100%' }} alignItems="center" justifyContent="space-around">
        <TextField
          disabled={isLoading}
          id="searchRecipe"
          label="Search for your menus"
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
            gap="20px"
            sx={{ flexWrap: 'wrap', width: '100%' }}
          >
            {currentMenus?.map((x) => (
              <Accordion sx={{ width: '78%' }} key={x.Id}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel3-content"
                  id="panel3-header"
                >
                  {`${x.name} - ${x.event}`}
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    justifyContent="space-around"
                    alignItems="center"
                    display="flex"
                    gap="20px"
                    sx={{ flexWrap: 'wrap', width: '100%' }}
                  >
                    {x.recipes?.map((y) => (
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
                <AccordionActions>
                  <Button
                    startIcon={<DeleteIcon />}
                    sx={{ color: 'red' }}
                    onClick={() => {
                      setSelectedMenu(undefined);
                      setIsGenerated(false);
                      deleteMenuMutation.mutate(x.Id);
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setSelectedMenu(x);
                      setSelectedTab(1);
                      setIsGenerated(false);
                    }}
                  >
                    Update
                  </Button>
                </AccordionActions>
              </Accordion>
            ))}
          </Box>
        </>
      )}

      <RecipeDetails open={openDetails} setOpen={setOpenDetails} item={selectedRecipe} />
    </Box>
  );
};
