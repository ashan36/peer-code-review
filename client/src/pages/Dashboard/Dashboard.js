import React, { useState, useEffect, useContext, useReducer } from "react";
import { useParams, useHistory, matchPath } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import ThreadDisplay from "./ThreadDisplay";
import { UserContext } from "context/UserContext";
import SideBar from "./SideBar";
import axios from "axios";
import { authHeader } from "functions/jwt";
import socket from "functions/sockets";

const useStyles = makeStyles({
  link: {
    textDecoration: "none",
    color: "#6E3ADB"
  },
  container: {
    marginLeft: "20vw",
    marginTop: "9vh",
    width: "80vw",
    height: "90vh"
  },
  gridItem: {
    marginLeft: "5vh",
    marginRight: "5vh",
    height: "80vh"
  }
});

const initialState = {
  requests: {},
  reviews: {},
  assigned: {}
};

const reducer = (state, action) => {
  const updateThread = (thread, collection) => {
    const newState = { ...collection };
    newState[thread._id] = thread;
    return newState;
  };

  const deleteThread = (threadId, collection) => {
    const newState = { ...collection };
    delete newState[threadId];
    return newState;
  };

  switch (action.type) {
    case "getThreads":
      return {
        requests: action.payload.requests,
        reviews: action.payload.reviews,
        assigned: action.payload.assigned
      };
    case "updateRequests":
      return {
        requests: updateThread(action.payload, state.requests),
        reviews: state.reviews,
        assigned: state.assigned
      };
    case "updateReviews":
      return {
        reviews: updateThread(action.payload, state.reviews),
        requests: state.requests,
        assigned: state.assigned
      };
    case "updateAssigned":
      return {
        assigned: updateThread(action.payload, state.assigned),
        requests: state.requests,
        reviews: state.reviews
      };
    case "deleteAssigned":
      return {
        assigned: deleteThread(action.payload, state.assigned),
        requests: state.requests,
        reviews: state.reviews
      };
    default:
      throw new Error("State update error");
  }
};

const Dashboard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const classes = useStyles();
  const [selectedThread, setSelectedThread] = useState(null);
  var { threadParam, typeParam } = useParams();
  const routeHistory = useHistory();

  // user context
  const { user } = useContext(UserContext);

  const getReviews = async () => {
    //helper function to turn response arrays into objects keyed by their id
    const createThreadObj = array => {
      var collection = {};
      array.forEach(thread => {
        collection[thread._id] = thread;
      });
      return collection;
    };

    try {
      const { data } = await axios({
        url: `/threads/all/${user._id}`,
        method: "get",
        headers: {
          "Content-Type": "application/json",
          ...authHeader().headers
        }
      });
      if (data.errors) {
        return; //TODO alert user
      } else {
        if (data.success) {
          dispatch({
            type: "getThreads",
            payload: {
              requests: createThreadObj(data.requests),
              reviews: createThreadObj(data.reviews),
              assigned: createThreadObj(data.assigned)
            }
          });
          return;
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleThreadRefresh = async (threadId, type) => {
    try {
      const response = await axios({
        method: "get",
        url: `/thread/${threadId}`,
        headers: { "content-type": "application/json", ...authHeader().headers }
      });
      if (response.data.success) {
        switch (type) {
          case "requests":
            dispatch({ type: "updateRequests", payload: response.data.thread });
            break;
          case "reviews":
            dispatch({ type: "updateReviews", payload: response.data.thread });
            break;
          case "assigned":
            dispatch({ type: "updateAssigned", payload: response.data.thread });
            break;
        }
        if (threadParam === threadId) {
          setSelectedThread(response.data.thread);
        }
      }
    } catch (err) {
      window.location.reload(true); //If there's an error, refresh the whole page
    }
  };

  const handleAssignmentActions = async (threadId, decline) => {
    dispatch({ type: "deleteAssigned", payload: threadId });
    if (!decline) {
      handleThreadRefresh(threadId, "reviews"); // Refresh the thread and treat as a review instead of assigned.
      routeHistory.push("/dashboard/reviews/" + threadId);
    } else {
      routeHistory.replace("/dashboard");
    }
  };

  useEffect(() => {
    if (user) {
      getReviews();
    }
  }, []);

  const selectDefault = () => {
    if (threadParam) {
      getThread();
    } else if (typeParam) {
      getType();
    } else {
      getDefault();
    }
  };

  const getThread = () => {
    switch (typeParam) {
      case "requests":
        setSelectedThread(state.requests[threadParam]);
        break;
      case "reviews":
        setSelectedThread(state.reviews[threadParam]);
        break;
      case "assigned":
        setSelectedThread(state.assigned[threadParam]);
        break;
      default:
        return null;
    }
  };

  const getType = () => {
    switch (typeParam) {
      case "requests":
        if (Object.values(state.requests).length > 0) {
          setSelectedByType(state.requests, "requests");
        }
        break;
      case "reviews":
        if (Object.values(state.reviews).length > 0) {
          setSelectedByType(state.reviews, "reviews");
        }
        break;
      case "assigned":
        if (Object.values(state.assigned).length > 0) {
          setSelectedByType(state.assigned, "assigned");
        }
        break;
      default:
        return null;
    }
  };

  const getDefault = () => {
    if (Object.values(state.requests).length > 0) {
      setSelectedByType(state.requests, "requests");
    } else if (Object.values(state.reviews).length > 0) {
      setSelectedByType(state.reviews, "reviews");
    } else if (Object.values(state.assigned).length > 0) {
      setSelectedByType(state.assigned, "assigned");
    }
  };

  const setSelectedByType = (typeState, typeName) => {
    threadParam = Object.values(typeState)[0]._id;
    setSelectedThread(typeState[threadParam]);
    routeHistory.replace(`/dashboard/${typeName}/${threadParam}`);
  };

  useEffect(() => {
    selectDefault();
  }, [threadParam, typeParam, state.requests, state.reviews, state.assigned]);

  const handleNotification = notification => {
    const match = matchPath(notification.link, {
      path: "/dashboard/:typeParam/:threadParam"
    });
    handleThreadRefresh(match.params.threadParam, match.params.typeParam);
  };

  useEffect(() => {
    socket.subscribe("dashboard", handleNotification);

    return () => socket.unsubscribe("dashboard");
  }, []);

  return (
    <div>
      <SideBar
        requests={Object.values(state.requests)}
        reviews={Object.values(state.reviews)}
        assigned={Object.values(state.assigned)}
        threadParam={threadParam}
        typeParam={typeParam}
        setSelectedThread={setSelectedThread}
      ></SideBar>
      <Grid container className={classes.container}>
        <Grid item xs={12} className={classes.gridItem}>
          <ThreadDisplay
            threadData={selectedThread}
            user={user}
            refreshThread={handleThreadRefresh}
            assignmentActions={handleAssignmentActions}
            typeParam={typeParam}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
