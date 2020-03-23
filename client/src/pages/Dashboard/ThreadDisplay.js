import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  Paper,
  Typography,
  Backdrop,
  CircularProgress,
  makeStyles,
  Button,
  Tooltip
} from "@material-ui/core";
import { Rating } from "@material-ui/lab";
import PostDisplay from "./PostDisplay";
import AlertSnackbar from "components/AlertSnackbar";
import { TextEditor } from "components";
import { authHeader } from "functions/jwt";

const useStyles = makeStyles({
  root: { padding: "5%" },
  backdrop: {
    zIndex: 900,
    color: "#fff"
  },
  spinner: {
    position: "relative",
    left: "8vh"
  },
  header: {
    background: "white",
    width: "100%",
    padding: "2em 2em",
    marginBottom: "8px"
  },
  container: {
    paddingBottom: "4vh"
  },
  postWrapper: {
    background: "white",
    width: "100%",
    padding: "0 3em"
  },
  editorWrapper: {
    background: "white",
    width: "100%"
  },
  threadTitle: {
    fontWeight: "500",
    display: "inline-flex"
  },
  threadDate: {
    fontWeight: "500",
    color: "grey",
    display: "block"
  },
  rating: {
    float: "right"
  },
  replyButton: {
    float: "right"
  },
  editButton: {
    backgroundColor: "#43DDC1",
    textTransform: "none"
  },
  postButton: {
    backgroundColor: "#43DDC1",
    textTransform: "none",
    margin: "1vh 0 4vh 0"
  },
  declineButton: {
    backgroundColor: "#43DDC1",
    textTransform: "none",
    margin: "1em 1em",
    float: "right"
  }
});

const ThreadDisplay = ({
  threadData,
  user,
  refreshThread,
  assignmentActions,
  typeParam
}) => {
  const classes = useStyles();

  const [replyButtonText, setReplyButtonText] = useState("Reply");
  const [participants, setParticipants] = useState(null);

  const getParticipants = async () => {
    console.log("getting participants");
    try {
      const { data } = await axios({
        url: `/thread/${threadData._id}/posts/authors`,
        method: "get",
        headers: { ...authHeader().headers }
      });
      if (data.errors) {
        console.log(data.errors);
        return;
      }
      console.log(data);
      setParticipants(data.authors);
    } catch (err) {
      console.log(err);
      return;
    }
  };

  useEffect(() => {
    getParticipants();
  }, [threadData]);

  //Editor state
  const [readOnly, setReadOnly] = useState(true);
  const [editorHasContent, setEditorHasContent] = useState(false);
  const [submitState, setSubmitState] = useState(false);

  const handleHasContent = value => {
    setEditorHasContent(value);
  };

  //User messaging state
  const [pageAlerts, setPageAlerts] = useState(new Set());
  const [postSuccessAlert, setPostSuccessAlert] = useState(false);
  const [alertState, setAlertState] = useState(false);

  const handleErrors = error => {
    var alerts = new Set();
    alerts.add(error);
    setPageAlerts(alerts);
    setAlertState(true);
  };

  //reset alerts
  const resetAlerts = () => {
    setAlertState(false);
    setPostSuccessAlert(false);
    const alerts = new Set();
    setPageAlerts(alerts);
  };

  const handleToggleReply = () => {
    setReadOnly(!readOnly);
    if (replyButtonText === "Reply") {
      setReplyButtonText("Cancel");
    } else {
      setReplyButtonText("Reply");
    }
  };

  let displayDecline = false;
  if (typeParam) {
    if (typeParam === "assigned") {
      displayDecline = true;
    }
  }

  const handleDecline = async () => {
    let alerts = new Set();
    try {
      const response = await axios({
        method: "patch",
        url: `/user/${user._id}/decline-request/${threadData._id}`,
        headers: { "content-type": "application/json" }
      });
      if (response.data.success) {
        alerts.add("Request declined successfully");
        setPageAlerts(alerts);
        setPostSuccessAlert(true);
        assignmentActions(threadData._id, true);
      } else throw new Error("Request unsuccessful");
    } catch (err) {
      alerts.add("Could not decline request");
      setPageAlerts(alerts);
      setAlertState(true);
      setSubmitState(false);
    }
  };

  const handleSaveReply = () => {
    if (!editorHasContent) {
      handleErrors("New content cannot be blank");
      setSubmitState(false);
    } else {
      setSubmitState(true);
      setReplyButtonText("Reply");
    }
  };

  const handlePostEdit = async ({ postId, data }) => {
    const requestData = {
      author: user._id,
      authorName: user.name,
      content: data
    };

    if (postId) {
      //Truthy if this is a post edit
      try {
        var alerts = new Set();
        const response = await axios({
          method: "put",
          url: `/thread/${threadData._id}/post/${postId}`,
          headers: {
            "content-type": "application/json",
            ...authHeader().headers
          },
          data: JSON.stringify(requestData)
        });
        if (response.data.success) {
          alerts.add("Post edited successfully!");
          setPageAlerts(alerts);
          setPostSuccessAlert(true);
          if (typeParam) {
            refreshThread(threadData._id, typeParam);
          } else throw new Error("Request unsuccessful");
        }
      } catch (err) {
        alerts.add("Post Edit failed");
        setPageAlerts(alerts);
        setAlertState(true);
        setSubmitState(false);
      }
    } else {
      //This is a new reply
      try {
        var alerts = new Set();
        const response = await axios({
          method: "post",
          url: `/thread/${threadData._id}/post`,
          headers: {
            "content-type": "application/json",
            ...authHeader().headers
          },
          data: JSON.stringify(requestData)
        });
        if (response.data.success) {
          alerts.add("Reply posted successfully!");
          setPageAlerts(alerts);
          setPostSuccessAlert(true);
          setSubmitState(false);
          setReadOnly(true);
          if (typeParam) {
            if (typeParam === "assigned") {
              assignmentActions(threadData._id, false);
            } else refreshThread(threadData._id, typeParam);
          }
        } else throw new Error("Request unsuccessful");
      } catch (err) {
        alerts.add("Reply post failed");
        setPageAlerts(alerts);
        setAlertState(true);
        setSubmitState(false);
      }
    }
  };

  const getLocalDate = mongoDate => {
    const localDate = new Date(mongoDate);
    return localDate.toLocaleDateString();
  };

  const handleRating = async (event, newValue) => {
    const updateRating = async () => {
      const response = await axios({
        method: "put",
        url: `/thread/${threadData._id}/rating/${newValue}`,
        headers: {
          ...authHeader().headers
        }
      });
      if (!response.data.success) {
        throw new Error("Failed to update status");
      }
    };

    try {
      var alerts = new Set();
      await updateRating();
      if (typeParam) {
        await refreshThread(threadData._id, typeParam);
      }
      alerts.add("Rating updated");
      setPageAlerts(alerts);
      setPostSuccessAlert(true);
    } catch (err) {
      alerts.add("Rating update failed");
      setPageAlerts(alerts);
      setAlertState(true);
    }
  };

  const ratingComponent = () => {
    if (threadData.rating && threadData.status >= 2) {
      if (threadData.creator === user._id) {
        return (
          <div className={classes.rating}>
            <Typography variant="subtitle2" align="right">
              Rate this review
            </Typography>
            <Rating value={threadData.rating} onChange={handleRating} />
          </div>
        );
      } else if (threadData.reviewer === user._id) {
        return (
          <div className={classes.rating}>
            <Typography variant="subtitle2" align="right">
              Rating
            </Typography>
            <Rating value={threadData.rating} readOnly />
          </div>
        );
      }
    }
    return <></>;
  };

  if (!threadData || !participants) {
    return (
      <div>
        <Backdrop className={classes.backdrop} open={true}>
          <CircularProgress
            className={classes.spinner}
            color="secondary"
          ></CircularProgress>
        </Backdrop>
      </div>
    );
  } else {
    console.log(participants);
    return (
      <div className={classes.root}>
        <Grid container className={classes.container}>
          <Paper className={classes.header} elevation={3}>
            <Grid item xs={12}>
              <Typography
                className={classes.threadTitle}
                variant="h4"
                align="left"
              >
                {threadData.title}
              </Typography>
              {ratingComponent()}
              {displayDecline ? (
                <Tooltip title="Decline to review this request?">
                  <Button
                    className={classes.declineButton}
                    variant="contained"
                    color="primary"
                    onClick={handleDecline}
                  >
                    Decline
                  </Button>
                </Tooltip>
              ) : (
                <span />
              )}
              <Typography
                className={classes.threadDate}
                variant="subtitle1"
                align="left"
              >
                {getLocalDate(threadData.createdAt)}
              </Typography>
            </Grid>
          </Paper>
          <Paper className={classes.postWrapper} elevation={3}>
            <Grid item xs={12}>
              {threadData.posts.map(post => {
                return (
                  <PostDisplay
                    author={participants[post.author]}
                    user={user}
                    postData={post}
                    postLanguage={threadData.language.name}
                    key={post._id}
                    onEditPost={handlePostEdit}
                    onErrors={handleErrors}
                  ></PostDisplay>
                );
              })}
            </Grid>
            <Grid item className={classes.replyButton} xs={1}>
              <Button
                className={classes.editButton}
                variant="contained"
                color="primary"
                onClick={handleToggleReply}
              >
                {replyButtonText}
              </Button>
            </Grid>
            <Grid item className={classes.editorWrapper} xs={12}>
              <TextEditor
                selectedLanguage={threadData.language.name}
                onSubmit={handlePostEdit}
                didSubmit={submitState}
                hasContent={handleHasContent}
                readOnly={readOnly}
              ></TextEditor>
            </Grid>
            <Grid item xs={12} className={classes.editorWrapper}>
              {readOnly ? (
                <div></div>
              ) : (
                <Button
                  className={classes.postButton}
                  variant="contained"
                  color="primary"
                  onClick={handleSaveReply}
                >
                  Post
                </Button>
              )}
            </Grid>
          </Paper>
        </Grid>
        <AlertSnackbar
          openAlert={alertState}
          messages={[...pageAlerts]}
          alertsClosed={resetAlerts}
          variant="error"
          autoHideDuration="6000"
        ></AlertSnackbar>
        <AlertSnackbar
          openAlert={postSuccessAlert}
          messages={[...pageAlerts]}
          alertsClosed={resetAlerts}
          variant="success"
          autoHideDuration="6000"
        ></AlertSnackbar>
      </div>
    );
  }
};

export default ThreadDisplay;
