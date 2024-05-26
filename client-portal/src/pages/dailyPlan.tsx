import { useState } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import { Tab, Tabs } from '@mui/material';

import { useGetClientUser } from '../api/clientUserController';
import { DailyPlan } from '../api/entities';
import { AddDailyPlanTab } from '../components/dailyplan/AddDailyPlanTab';
import { DailyPlanTab } from '../components/dailyplan/DailyPlanTab';
import { GenerateDailyPlanTab } from '../components/dailyplan/GenerateDailyPlanTab';
import { Layout } from '../components/layout/Layout';
import { withAuth } from '../config/withauth';

export const DailyPlanPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDailyPlan, setSelectedDailyPlan] = useState<DailyPlan | undefined>();
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const { data: clientUser } = useGetClientUser();

  return (
    <Layout>
      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)} centered>
        <Tab label="Daily Plans" value={0} />
        <Tab
          onClick={() => {
            setSelectedDailyPlan(undefined);
            setIsGenerated(false);
          }}
          label="Add Daily Plan"
          value={1}
        />
        <Tab
          iconPosition="start"
          icon={clientUser?.subscription === 'FREE' ? <LockIcon /> : undefined}
          disabled={clientUser?.subscription === 'FREE'}
          label="Generate Daily Plan"
          value={2}
        />
      </Tabs>

      <>
        {selectedTab === 0 && (
          <DailyPlanTab
            setSelectedTab={setSelectedTab}
            setSelectedDailyPlan={setSelectedDailyPlan}
            setIsGenerated={setIsGenerated}
          />
        )}

        {selectedTab === 1 && (
          <AddDailyPlanTab
            isGenerated={isGenerated}
            selectedDailyPlan={selectedDailyPlan}
            setSelectedTab={setSelectedTab}
          />
        )}

        {selectedTab === 2 && (
          <GenerateDailyPlanTab
            setSelectedDailyPlan={setSelectedDailyPlan}
            setIsGenerated={setIsGenerated}
            setSelectedTab={setSelectedTab}
          />
        )}
      </>
    </Layout>
  );
};

export default withAuth(DailyPlanPage);
