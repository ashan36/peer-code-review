import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import {
  Grid,
  Paper,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  makeStyles
} from "@material-ui/core";
import { UserContext } from "context/UserContext";
import { TextEditor } from "components/index";
import AlertSnackbar from "components/AlertSnackbar";
import SubmitButton from "components/TextEditor/components/SubmitButton";
import { authHeader } from "functions/jwt";

const useStyles = makeStyles({
  root: {
    padding: "9vh 5%"
  },
  wrapper: {
    background: "white",
    borderRadius: "6px",
    width: "75%",
    maxHeight: "100vh",
    margin: "8vh auto 0 auto",
    padding: "3vh 10vh"
  },
  header: {
    margin: "4vh",
    fontWeight: "500"
  },
  editor: {
    padding: "10px",
    margin: "0",
    height: "50vh"
  },
  textInput: {
    textAlign: "center",
    width: "100%"
  },
  languageSelect: {
    width: "80%"
  },
  submit: {
    justifyContent: "center",
    display: "flex"
  },
  errorDisplay: {
    margin: "auto",
    padding: "0"
  }
});

const CodeUpload = () => {
  const { user, setUser } = useContext(UserContext);
  const routeHistory = useHistory();

  const classes = useStyles();
  const [requestTitle, setRequestTitle] = useState("");
  const [requestLanguage, setRequestLanguage] = useState("");
  const [editorHasContent, setEditorHasContent] = useState(false);
  const [submitState, setSubmitState] = useState(false);
  const [pageAlerts, setPageAlerts] = useState(new Set());
  const [alertState, setAlertState] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const handleTitleChange = event => {
    setRequestTitle(event.target.value);
  };

  const handleLanguageChange = event => {
    setRequestLanguage(event.target.value);
  };

  var getLanguages = [];
  if (user) {
    getLanguages = Object.keys(user.experience);
  }

  //Handle page errors and update submission state
  const startSubmit = () => {
    let languageError = requestLanguage === "";
    let titleError = requestTitle === "";
    let errorSet = new Set();
    if (languageError || titleError || !editorHasContent) {
      if (languageError) {
        errorSet.add("Please select a language for your request");
      }
      if (titleError) {
        errorSet.add("Please add a title to your request");
      }
      if (!editorHasContent) {
        errorSet.add("Please add some content to your request");
      }
      setPageAlerts(errorSet);
      setAlertState(true);
    } else {
      //No errors, begin submitting
      setPageAlerts(new Set());
      setSubmitState(true);
    }
  };

  //reset alerts
  const resetAlerts = () => {
    setAlertState(false);
    setPostSuccess(false);
  };

  //check if user has typed into editor
  const handleHasContent = value => {
    setEditorHasContent(value);
  };

  //get data from editor component
  const handleSubmit = async ({ data }) => {
    //Wrap up editor data with user and language data and send to server.
    const requestData = {
      title: requestTitle,
      language: {
        name: requestLanguage,
        experience: user.experience[requestLanguage]
      },
      content: data,
      user: user
    };

    let alerts = new Set();

    try {
      const removeCredit = await axios.put(
        `/user/${user._id}/add-credit`,
        {
          credits: -1
        },
        authHeader()
      );
      const response = await axios({
        method: "post",
        url: "/create-request",
        headers: {
          "content-type": "application/json",
          ...authHeader().headers
        },
        data: JSON.stringify(requestData)
      });
      //redirect user to their reviews page

      if (response.data.success && removeCredit.data.success) {
        alerts.add("Code upload successful!");
        setPageAlerts(alerts);
        setPostSuccess(true);
        user.credits += -1;
        setUser(user);
        setTimeout(() => {
          routeHistory.push(`/dashboard/requests/${response.data.threadId}`);
        }, 2000);
      }
    } catch (err) {
      if (err.message.includes("403")) {
        alerts.add("Please purchase credits to get a review");
        setPageAlerts(alerts);
        setAlertState(true);
      }
      console.log(err);
    }
  };

  return (
    <div className={classes.root}>
      <Paper elevation={5} className={classes.wrapper}>
        <Grid container justify="center" alignItems="center" spacing={2}>
          <Typography className={classes.header} variant="h3" align="center">
            Request a code review
          </Typography>
          <Grid item xs={8}>
            <TextField
              className={classes.textInput}
              align="left"
              label="Title"
              variant="outlined"
              onChange={handleTitleChange}
            />
          </Grid>
          <Grid item xs={4}>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              className={classes.languageSelect}
              labelid="language-select-label"
              id="language-select"
              value={requestLanguage}
              onChange={handleLanguageChange}
            >
              {getLanguages.map(language => {
                return (
                  <MenuItem value={language} key={language}>
                    {language}
                  </MenuItem>
                );
              })}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <TextEditor
              className={classes.editor}
              selectedLanguage={requestLanguage}
              onSubmit={handleSubmit}
              didSubmit={submitState}
              hasContent={handleHasContent}
              existingContent={null}
              readOnly={false}
            ></TextEditor>
          </Grid>
          <Grid item xs={12} className={classes.submit}>
            <SubmitButton onChange={startSubmit} />
          </Grid>
          <Grid item xs={12} className={classes.errorDisplay}>
            <AlertSnackbar
              openAlert={alertState}
              messages={[...pageAlerts]}
              alertsClosed={resetAlerts}
              variant="error"
              autoHideDuration="6000"
            ></AlertSnackbar>
            <AlertSnackbar
              openAlert={postSuccess}
              messages={[...pageAlerts]}
              alertsClosed={resetAlerts}
              variant="success"
            ></AlertSnackbar>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default CodeUpload;
