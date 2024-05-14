import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';

const pages = [
  { name: 'Recipes', path: '/recipe' },
  { name: 'Menus', path: '/menu' },
  { name: 'Daily Programs', path: '/dailyProgram' },
];

export const Navigation = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            KITCHEN MASTER
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={(e) => setAnchorElNav(e.currentTarget)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.name}
                  onClick={() => {
                    router.push(page.path);
                    handleCloseNavMenu();
                  }}
                >
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            KITCHEN MASTER
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={() => {
                  router.push(page.path);
                  handleCloseNavMenu();
                }}
                sx={{
                  my: 2,
                  mx: 1,
                  color: 'white',
                  display: 'block',
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>
          <Box
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'flex' }, justifyContent: 'flex-end' }}
          >
            <Button
              key="profile"
              onClick={() => {
                router.push('/profile');
                handleCloseNavMenu();
              }}
              sx={{
                my: 2,
                mx: 1,
                color: 'white',
                display: 'block',
              }}
            >
              Profile
            </Button>
            <Button
              key="contactus"
              onClick={() => {
                // TODO:
                handleCloseNavMenu();
              }}
              sx={{
                my: 2,
                mx: 1,
                color: 'white',
                display: 'block',
              }}
            >
              Contact Us
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
