import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Drawer,
  SwipeableDrawer,
  List,
  Grid,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  Collapse
} from "@material-ui/core";
import {
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight
} from "@material-ui/icons";
import { SizeContext } from "context";

const useStyles = makeStyles({
  header: {
    padding: "1vh",
    fontSize: "2rem",
    fontWeight: 700
  },
  counter: {
    fontSize: "1.5rem",
    color: "#43DDC1"
  },
  drawer: {
    height: "100%",
    width: "350px",
    top: "max(9vh, 56px)",
    zIndex: 1000 // z-index of app bar is 1100, default of drawer is 1200
  },
  drawerContentWrapper: {
    display: "flex",
    flexDirection: "row",
    height: "100%"
  },
  list: {
    paddingLeft: "10px",
    paddingRight: "15px"
  },
  selected: {
    color: "#43DDC1",
    border: "1px solid #43DDC1",
    borderRadius: "5px"
  },
  notSelected: {
    borderRadius: "5px"
  },
  link: {
    textDecoration: "none",
    color: "black"
  },
  drawerControlOpen: {
    position: "relative",
    left: "300px",
    height: "50px",
    width: "50px",
    marginTop: "10px",
    color: "#888888",
    "&:hover": {
      color: "black"
    }
  },
  drawerControlClosed: {
    position: "fixed",
    top: "calc(50vh - 25px)",
    height: "50px",
    width: "50px",
    color: "#888888",
    "&:hover": {
      color: "black"
    }
  }
});

const SideBar = ({
  requests,
  reviews,
  assigned,
  threadParam,
  typeParam,
  setSelectedThread,
  toggleSidebar
}) => {
  const classes = useStyles();
  const { width, height } = useContext(SizeContext);

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [assignedOpen, setAssignedOpen] = useState(false);

  const toggleDrawer = open => {
    setDrawerOpen(prev => !prev);
    toggleSidebar();
  };

  const openRequests = () => {
    setRequestsOpen(!requestsOpen);
  };

  const openReviews = () => {
    setReviewsOpen(!reviewsOpen);
  };

  const openAssigned = () => {
    setAssignedOpen(!assignedOpen);
  };

  const isSelected = id => {
    if (threadParam) {
      if (id === threadParam) {
        return classes.selected;
      } else return classes.notSelected;
    } else return classes.notSelected;
  };

  const getLocalDate = mongoDate => {
    const localDate = new Date(mongoDate);
    return localDate.toLocaleDateString();
  };

  useEffect(() => {
    switch (typeParam) {
      case "requests":
        setRequestsOpen(true);
        break;
      case "reviews":
        setReviewsOpen(true);
        break;
      case "assigned":
        setAssignedOpen(true);
        break;
      default:
        setRequestsOpen(true);
    }
  }, [typeParam]);

  const drawerContent = () => {
    return (
      <List disablePadding={true}>
        <ListItem button onClick={openRequests}>
          <ListItemText>
            <Typography className={classes.header}>
              Requests{" "}
              <span className={classes.counter}>{`(${requests.length})`}</span>
            </Typography>
          </ListItemText>
          {requestsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={requestsOpen}>
          <List className={classes.list}>
            {requests.map(thread => {
              return (
                <Link
                  className={classes.link}
                  to={"/dashboard/requests/" + thread._id}
                  key={thread._id}
                >
                  <ListItem
                    className={isSelected(thread._id)}
                    button
                    onClick={() => setSelectedThread(thread)}
                  >
                    <ListItemText
                      primary={thread.title}
                      secondary={getLocalDate(thread.createdAt)}
                    />
                  </ListItem>
                </Link>
              );
            })}
          </List>
        </Collapse>
        <Divider />
        <ListItem button onClick={openReviews}>
          <ListItemText>
            <Typography className={classes.header}>
              Reviews{" "}
              <span className={classes.counter}>{`(${reviews.length})`}</span>
            </Typography>
          </ListItemText>
          {reviewsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={reviewsOpen}>
          <List className={classes.list}>
            {reviews.map(thread => {
              return (
                <Link
                  className={classes.link}
                  to={"/dashboard/reviews/" + thread._id}
                  key={thread._id}
                >
                  <ListItem
                    className={isSelected(thread._id)}
                    button
                    onClick={() => setSelectedThread(thread)}
                  >
                    <ListItemText
                      primary={thread.title}
                      secondary={getLocalDate(thread.createdAt)}
                    />
                  </ListItem>
                </Link>
              );
            })}
          </List>
        </Collapse>
        <Divider />
        <ListItem button onClick={openAssigned}>
          <ListItemText>
            <Typography className={classes.header}>
              Assigned{" "}
              <span className={classes.counter}>{`(${assigned.length})`}</span>
            </Typography>
          </ListItemText>
          {assignedOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={assignedOpen}>
          <List className={classes.list}>
            {assigned.map(thread => {
              return (
                <Link
                  className={classes.link}
                  to={"/dashboard/assigned/" + thread._id}
                  key={thread._id}
                >
                  <ListItem
                    className={isSelected(thread._id)}
                    button
                    onClick={() => setSelectedThread(thread)}
                  >
                    <ListItemText
                      primary={thread.title}
                      secondary={getLocalDate(thread.createdAt)}
                    />
                  </ListItem>
                </Link>
              );
            })}
          </List>
        </Collapse>
      </List>
    );
  };

  return (
    <div>
      <Drawer
        classes={{ paper: classes.drawer }}
        open={drawerOpen}
        elevation={3}
        variant="persistent"
      >
        {drawerOpen ? (
          <ChevronLeft
            className={classes.drawerControlOpen}
            onClick={toggleDrawer}
          />
        ) : (
          <ChevronLeft className={classes.drawerControlOpen} />
        )}
        <Divider />
        {drawerContent()}
      </Drawer>
      {!drawerOpen && (
        <ChevronRight
          className={classes.drawerControlClosed}
          onClick={toggleDrawer}
        />
      )}
    </div>
  );
};

export default SideBar;
