import React, { useState, useEffect, useContext, useReducer } from "react";
import {
  Menu,
  MenuItem,
  Grid,
  makeStyles,
  IconButton,
  Typography,
  Divider
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { UserContext } from "context/UserContext";
import axios from "axios";
import NotificationsNoneRoundedIcon from "@material-ui/icons/NotificationsNoneRounded";
import NotificationsActiveRoundedIcon from "@material-ui/icons/NotificationsActiveRounded";
import { blue } from "@material-ui/core/colors";
import socket from "functions/sockets";

const useStyles = makeStyles({
  notificationIcon: {
    color: "white"
  },
  activeNotificationIcon: {
    color: "#43DDC1"
  },
  menu: {
    padding: "0"
  },
  link: {
    textDecoration: "none",
    color: "black",
    minHeight: "5vh",
    textAlign: "start",
    background: "white"
  },
  seen: { background: "white" },
  unseen: {
    background: "#CCBAF2"
  },
  itemWrapper: {
    padding: "0 1vh 0 0",
    margin: "0"
  },
  focused: {
    background: "white"
  },
  time: {
    color: "#696969"
  }
});

const initialState = {
  notifications: []
};

const reducer = (state, action) => {
  const updateUnread = () => {
    const unread = state.notifications.map(ele => {
      ele.seen = true;
      return ele;
    });
    axios.put(`/notifications/update-read`, { notifications: unread });
    return unread;
  };

  switch (action.type) {
    case "newNotification":
      return { notifications: [action.payload, ...state.notifications] };
    case "getNotifications":
      return { notifications: action.payload };
    case "setRead":
      return { notifications: updateUnread() };
    default:
      throw new Error("State update error");
  }
};

const timeMap = {
  minute: 60000,
  hour: 3600000,
  day: 86400000,
  week: 604800000,
  month: 2592000000,
  year: 31536000000
};

const Notifications = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const classes = useStyles();
  const [seen, setSeen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { user } = useContext(UserContext);

  useEffect(() => {
    const getNotifications = async () => {
      const { data } = await axios.get(`/notifications/${user._id}`);
      dispatch({ type: "getNotifications", payload: data.reverse() });
    };
    getNotifications();
    socket.subscribe("notifications", handleSocketNotification);

    return () => socket.unsubscribe("notifications");
  }, []);

  const handleSocketNotification = notification => {
    dispatch({ type: "newNotification", payload: notification });
  };

  useEffect(() => {
    setSeen(state.notifications.every(ele => ele.seen === true));
  });

  const handleMenu = e => {
    setAnchorEl(e.currentTarget);
    setSeen(true);
  };

  const calcDate = date => {
    const created = new Date(date);
    const now = Date.now();
    const timeDelta = now - created.valueOf();
    let elapsed = 0;
    if (timeDelta < timeMap.minute) {
      return "just now";
    } else if (timeDelta < timeMap.hour) {
      elapsed = timeDelta / timeMap.minute;
      elapsed = Math.floor(elapsed);
      return `${elapsed} minute(s) ago`;
    } else if (timeDelta < timeMap.day) {
      elapsed = timeDelta / timeMap.hour;
      elapsed = Math.floor(elapsed);
      return `${elapsed} hour(s) ago`;
    } else if (timeDelta < timeMap.week) {
      elapsed = timeDelta / timeMap.day;
      elapsed = Math.floor(elapsed);
      return `${elapsed} day(s) ago`;
    } else if (timeDelta < timeMap.month) {
      elapsed = timeDelta / timeMap.week;
      elapsed = Math.floor(elapsed);
      return `${elapsed} week(s) ago`;
    } else if (timeDelta < timeMap.year) {
      elapsed = timeDelta / timeMap.month;
      elapsed = Math.floor(elapsed);
      return `${elapsed} month(s) ago`;
    } else {
      return "over a year ago";
    }
  };

  const handleClose = () => {
    var updateRequired = false;
    for (let i = 0; i < state.notifications.length; i++) {
      if (!state.notifications[i].seen) {
        updateRequired = true;
        break;
      }
    }

    if (updateRequired) {
      dispatch({ type: "setRead" });
    }

    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        onClick={handleMenu}
        disabled={state.notifications.length < 1}
        disableTouchRipple
      >
        {seen ? (
          <NotificationsNoneRoundedIcon
            fontSize="large"
            className={classes.notificationIcon}
          />
        ) : (
          <div>
            <NotificationsActiveRoundedIcon
              fontSize="large"
              className={classes.activeNotificationIcon}
            />
          </div>
        )}
      </IconButton>
      <Menu
        id="notification-bell"
        className={classes.menu}
        anchorEl={anchorEl}
        transformOrigin={{
          vertical: -40,
          horizontal: "right"
        }}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 300,
            maxWidth: 500
          }
        }}
        MenuListProps={{
          disablePadding: true
        }}
      >
        {state.notifications.map(ele => {
          return (
            <div key={ele._id}>
              <Link to={ele.link} className={classes.link}>
                <MenuItem
                  className={`${classes.link} ${
                    ele.seen ? classes.seen : classes.unseen
                  }`}
                >
                  <Grid container className={classes.itemWrapper}>
                    <Grid item xs={12} className={classes.message}>
                      <Typography variant="h6">{ele.message}</Typography>
                    </Grid>
                    <Grid item xs={12} className={classes.time}>
                      <Typography variant="subtitle2">
                        {calcDate(ele.createdAt)}
                      </Typography>
                    </Grid>
                  </Grid>
                </MenuItem>
              </Link>
              <Divider className={classes.divider} />
            </div>
          );
        })}
      </Menu>
    </div>
  );
};

export default Notifications;
