import { useState } from 'react';

import { Tab, Tabs } from '@mui/material';

import { Layout } from '../components/layout/Layout';
import { EditProfileTab } from '../components/profile/EditProfileTab';
import { ProfileTab } from '../components/profile/ProfileTab';
import { withAuth } from '../config/withauth';

export const Profile = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <Layout>
      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)} centered>
        <Tab label="Profile" value={0} />
        <Tab label="Edit Profile" value={1} />
      </Tabs>

      <>
        {selectedTab === 0 && <ProfileTab setSelectedTab={setSelectedTab} />}

        {selectedTab === 1 && <EditProfileTab setSelectedTab={setSelectedTab} />}
      </>
    </Layout>
  );
};

export default withAuth(Profile);
