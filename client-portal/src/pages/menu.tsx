import { useState } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import { Tab, Tabs } from '@mui/material';

import { useGetClientUser } from '../api/clientUserController';
import { Menu } from '../api/entities';
import { Layout } from '../components/layout/Layout';
import { AddMenuTab } from '../components/menus/AddMenuTab';
import { GenerateMenuTab } from '../components/menus/GenerateMenuTab';
import { MenuTab } from '../components/menus/MenuTab';
import { withAuth } from '../config/withauth';

export const MenuPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedMenu, setSelectedMenu] = useState<Menu | undefined>();
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const { data: clientUser } = useGetClientUser();

  return (
    <Layout>
      <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)} centered>
        <Tab label="Menus" value={0} />
        <Tab
          onClick={() => {
            setSelectedMenu(undefined);
            setIsGenerated(false);
          }}
          label="Add Menu"
          value={1}
        />
        <Tab
          iconPosition="start"
          icon={clientUser?.subscription === 'FREE' ? <LockIcon /> : undefined}
          disabled={clientUser?.subscription === 'FREE'}
          label="Generate Menu"
          value={2}
        />
      </Tabs>

      <>
        {selectedTab === 0 && (
          <MenuTab
            setSelectedTab={setSelectedTab}
            setSelectedMenu={setSelectedMenu}
            setIsGenerated={setIsGenerated}
          />
        )}

        {selectedTab === 1 && (
          <AddMenuTab
            isGenerated={isGenerated}
            selectedMenu={selectedMenu}
            setSelectedTab={setSelectedTab}
          />
        )}

        {selectedTab === 2 && (
          <GenerateMenuTab
            setSelectedMenu={setSelectedMenu}
            setIsGenerated={setIsGenerated}
            setSelectedTab={setSelectedTab}
          />
        )}
      </>
    </Layout>
  );
};

export default withAuth(MenuPage);
