import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Box, Button, CircularProgress, Drawer, Pagination, TextField } from '@mui/material';

import { Recipe } from '../../api/entities';
import { useGetRecipes } from '../../api/recipeController';
import { useDebounceValue } from '../../hooks/useDebounceValue';
import { DeleteRecipe } from './DeleteRecipe';
import { Filters } from './Filters';
import { RecipeCard } from './RecipeCard';
import { RecipeDetails } from './RecipeDetails';

type RecipeTabProps = {
  setSelectedTab: Dispatch<SetStateAction<number>>;
  selectedRecipe: Recipe | undefined;
  setSelectedRecipe: Dispatch<SetStateAction<Recipe | undefined>>;
  setIsGenerated: Dispatch<SetStateAction<boolean>>;
};

export const RecipeTab = (props: RecipeTabProps) => {
  const { setSelectedTab, selectedRecipe, setSelectedRecipe, setIsGenerated } = props;

  const [openFilters, setOpenFilters] = useState(false);
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const debouncedSearch = useDebounceValue(currentSearch, 500);
  const [currentFilters, setCurrentFilters] = useState<string[]>([]);

  const [searchRequest, setSearchRequest] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDetails, setOpenDetails] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const scrollTop = () => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  };

  useEffect(() => {
    if (debouncedSearch || currentFilters.length > 0) {
      setSearchRequest(`${debouncedSearch}, ${currentFilters.join(', ')}`);
      setCurrentPage(1);
    } else {
      setSearchRequest('');
      setCurrentPage(1);
    }
  }, [debouncedSearch, currentFilters, currentFilters.length]);

  const { data: recipes, isLoading } = useGetRecipes(searchRequest, currentPage);

  return (
    <Box display="flex" flexDirection="column" sx={{ margin: '10px', width: '98%' }} gap="20px">
      <Box display="flex" sx={{ width: '100%' }} alignItems="center" justifyContent="space-around">
        <Button
          disabled={isLoading}
          sx={{ padding: '15px', marginRight: '15px' }}
          onClick={() => {
            setOpenFilters(true);
          }}
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
        >
          Apply More Filters
        </Button>

        <TextField
          disabled={isLoading}
          id="searchRecipe"
          label="Search for your recipes"
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
            {recipes?.recipes.map((x) => (
              <RecipeCard
                setIsGenerated={setIsGenerated}
                setSelectedTab={setSelectedTab}
                setOpenDelete={setOpenDelete}
                setOpenDetails={setOpenDetails}
                setSelectedRecipe={setSelectedRecipe}
                key={x.Id}
                item={x}
              />
            ))}
          </Box>

          <Box display="flex" justifyContent="center" sx={{ maxWidth: '90%' }}>
            {recipes && recipes.total > 0 && (
              <Pagination
                sx={{ marginBottom: '30px' }}
                onChange={(_, x) => {
                  setCurrentPage(x);
                  scrollTop();
                }}
                page={currentPage}
                count={Math.ceil((recipes.total ?? 12) / 12)}
                color="primary"
              />
            )}
          </Box>
        </>
      )}

      <RecipeDetails open={openDetails} setOpen={setOpenDetails} item={selectedRecipe} />

      <DeleteRecipe open={openDelete} setOpen={setOpenDelete} item={selectedRecipe} />

      <Drawer open={openFilters} onClose={() => setOpenFilters(false)}>
        <Filters
          currentFilters={currentFilters}
          setCurrentFilters={setCurrentFilters}
          setOpenFilters={setOpenFilters}
        />
      </Drawer>
    </Box>
  );
};
