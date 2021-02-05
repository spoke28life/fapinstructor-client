import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import ProfileIcon from "components/molecules/icons/ProfileIcon";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import { NavLink as RouteNavLink } from "react-router-dom";
import { useAuth0 } from "AuthProvider";

function ProfileButton() {
  const { logout, user, loginWithRedirect, isLoading } = useAuth0();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const logoutWithRedirect = () => {
    logout({
      returnTo: window.location.origin,
    });
  };

  const handleLogin = () => {
    const pathname = window.location.pathname;

    loginWithRedirect({
      appState: { returnTo: pathname },
    });
  };

  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem component={RouteNavLink} to="/profile">
        Profile
      </MenuItem>
      <MenuItem onClick={logoutWithRedirect}>Logout</MenuItem>
    </Menu>
  );

  if (!user) {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        disabled={isLoading}
      >
        Login
      </Button>
    );
  } else {
    return (
      <>
        <IconButton onClick={handleProfileMenuOpen}>
          <ProfileIcon user={user} />
        </IconButton>
        {renderMenu}
      </>
    );
  }
}

export default ProfileButton;
