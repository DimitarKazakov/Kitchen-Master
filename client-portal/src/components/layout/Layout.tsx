import { Box } from '@mui/material';

import { Navigation } from './Navigation';

type LayoutProps = {
  children: JSX.Element | JSX.Element[];
};
export const Layout = (props: LayoutProps) => {
  const { children } = props;

  return (
    <Box className="tw-bg-slate-300 tw-h-screen">
      <Navigation />

      <Box className="tw-bg-slate-300 tw-h-100">{children}</Box>
    </Box>
  );
};
