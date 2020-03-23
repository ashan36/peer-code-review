import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Drawer,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  Collapse
} from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";

const useStyles = makeStyles({
  header: {
    padding: "2vh",
    fontSize: "2rem",
    fontWeight: 700
  },
  counter: {
    fontSize: "1.5rem",
    color: "#43DDC1"
  },
  drawer: {
    minWidth: "280px",
    width: "18vw",
    height: "100%",
    top: "9vh",
    zIndex: 1000 // z-index of app bar is 1100, default of drawer is 1200
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
  }
});

const SideBar = ({
  requests,
  reviews,
  assigned,
  threadParam,
  typeParam,
  setSelectedThread
}) => {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [assignedOpen, setAssignedOpen] = useState(false);

  const toggleDrawer = open => {
    setDrawerOpen(prev => !prev);
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

  return (
    <div>
      <Drawer
        classes={{ paper: classes.drawer }}
        open={drawerOpen}
        variant="persistent"
        elevation={3}
      >
        <List disablePadding={true}>
          <ListItem button onClick={openRequests}>
            <ListItemText>
              <Typography className={classes.header}>
                Requests{" "}
                <span
                  className={classes.counter}
                >{`(${requests.length})`}</span>
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
                <span
                  className={classes.counter}
                >{`(${assigned.length})`}</span>
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
      </Drawer>
    </div>
  );
};

export default SideBar;
