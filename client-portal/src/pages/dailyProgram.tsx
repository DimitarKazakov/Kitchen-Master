import { useState } from 'react';

import { Tab, Tabs } from '@mui/material';

import { Layout } from '../components/layout/Layout';
import { withAuth } from '../config/withauth';

export const DailyProgram = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <Layout>
      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)} centered>
        <Tab label="Daily Programs" value={0} />
        <Tab label="Add Daily Program" value={1} />
        <Tab label="Generate Daily Program" value={2} />
      </Tabs>
    </Layout>
  );
};

export default withAuth(DailyProgram);
