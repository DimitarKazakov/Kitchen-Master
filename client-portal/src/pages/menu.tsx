import { useState } from 'react';

import { Tab, Tabs } from '@mui/material';

import { Layout } from '../components/layout/Layout';
import { withAuth } from '../config/withauth';

export const Menu = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <Layout>
      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)} centered>
        <Tab label="Menus" value={0} />
        <Tab label="Add Menu" value={1} />
        <Tab label="Generate Menu" value={2} />
      </Tabs>
    </Layout>
  );
};

export default withAuth(Menu);
