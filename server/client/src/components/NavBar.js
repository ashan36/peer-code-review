import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "context/UserContext";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Typography,
  makeStyles
} from "@material-ui/core";
import { Logo } from "./Logo";
import { Notifications, CustomAvatar } from "components";

const useStyles = makeStyles({
  bar: {
    justifyContent: "space-between",
    height: "9vh"
  },
  linkButton: {
    color: "white",
    marginLeft: "2vw",
    textTransform: "none"
  },
  codeButton: {
    color: "#43DDC1",
    border: "solid 2px #43DDC1",
    borderRadius: "3vh",
    fontWeight: "500",
    marginLeft: "2vw",
    padding: "5px 20px"
  },
  codeLink: {
    color: "#43DDC1",
    textDecoration: "none",
    textTransform: "none"
  },
  iconButton: {
    padding: "6px",
    marginLeft: "2vw"
  },
  notificationIcon: {
    color: "white"
  },
  profileButton: {
    color: "white"
  },
  user: {
    marginLeft: "1vw",
    textTransform: "none"
  },
  link: {
    textDecoration: "none",
    marginLeft: "1vw",
    textTransform: "none"
  },
  dropdownItem: {
    color: "black",
    margin: "0"
  },
  avatar: {
    margin: "auto",
    height: "45px",
    width: "45px"
  }
});

const NavBar = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  // user context
  const { user, logout } = useContext(UserContext);

  const handleMenu = e => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
  };

  return (
    <AppBar>
      <Toolbar className={classes.bar}>
        <Link to="/">
          <Logo />
        </Link>
        <Toolbar className={classes.right}>
          <Link className={classes.link} to="/dashboard">
            <Button className={classes.linkButton}> Reviews </Button>
          </Link>
          <Link to="/balance" className={classes.link}>
            <Button className={classes.linkButton}>Balance</Button>
          </Link>
          <div className={classes.iconButton}>
            <Notifications />
          </div>
          <Button className={classes.codeButton}>
            <Link className={classes.codeLink} to="/code-upload">
              Upload code
            </Link>
          </Button>
          <div>
            <IconButton
              className={classes.iconButton}
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              fontSize="large"
            ></IconButton>
            <Button className={classes.profileButton} onClick={handleMenu}>
              <CustomAvatar user={user} avatarStyles={classes.avatar} />
              <Typography className={classes.user}>
                {user ? user.name : "profile"}
              </Typography>
            </Button>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              open={open}
              onClose={handleClose}
            >
              <Link
                to={`/profile/${user._id}`}
                className={`${classes.link} ${classes.dropdownItem}`}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
              </Link>
              <Link
                to="/"
                className={`${classes.link} ${classes.dropdownItem}`}
              >
                <MenuItem onClick={handleClose}>My account</MenuItem>
              </Link>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
