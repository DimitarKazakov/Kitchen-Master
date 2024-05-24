import { useState } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import { Tab, Tabs } from '@mui/material';

import { useGetClientUser } from '../api/clientUserController';
import { Recipe } from '../api/entities';
import { Layout } from '../components/layout/Layout';
import { AddRecipeTab } from '../components/recipes/addRecipeTab';
import { GenerateRecipeTab } from '../components/recipes/generateRecipeTab';
import { RecipeTab } from '../components/recipes/recipeTab';
import { withAuth } from '../config/withauth';

export const RecipePage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>();
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const { data: clientUser } = useGetClientUser();
  return (
    <Layout>
      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)} centered>
        <Tab label="Recipes" value={0} />
        <Tab
          onClick={() => {
            setSelectedRecipe(undefined);
            setIsGenerated(false);
          }}
          label="Add Recipe"
          value={1}
        />
        <Tab
          iconPosition="start"
          icon={clientUser?.subscription === 'FREE' ? <LockIcon /> : undefined}
          disabled={clientUser?.subscription === 'FREE'}
          label="Generate Recipe"
          value={2}
        />
      </Tabs>

      <>
        {selectedTab === 0 && (
          <RecipeTab
            setSelectedTab={setSelectedTab}
            selectedRecipe={selectedRecipe}
            setSelectedRecipe={setSelectedRecipe}
            setIsGenerated={setIsGenerated}
          />
        )}

        {selectedTab === 1 && (
          <AddRecipeTab
            isGenerated={isGenerated}
            selectedRecipe={selectedRecipe}
            setSelectedTab={setSelectedTab}
          />
        )}

        {selectedTab === 2 && (
          <GenerateRecipeTab
            setSelectedRecipe={setSelectedRecipe}
            setIsGenerated={setIsGenerated}
            setSelectedTab={setSelectedTab}
          />
        )}
      </>
    </Layout>
  );
};

export default withAuth(RecipePage);
