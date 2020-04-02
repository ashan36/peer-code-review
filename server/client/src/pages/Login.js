import React, { useState, useEffect, useContext } from "react";
import { Link, Redirect } from "react-router-dom";
import { Button, TextField, Typography, makeStyles } from "@material-ui/core";
import { SignUpContainer } from "components";
import { UserContext, SizeContext } from "context";
import axios from "axios";
import socket from "functions/sockets";

const useStyles = makeStyles({
  input: {
    textAlign: "center",
    width: "60%",
    margin: "2vh"
  },
  smallInput: {
    backgroundColor: "#EEE",
    borderRadius: "5px"
  },
  text: {
    fontSize: "1.8em",
    fontWeight: "800",
    margin: "2vh"
  },
  button: {
    backgroundColor: "#43DDC1",
    marginLeft: "30%",
    marginRight: "30%",
    marginTop: "1vh",
    marginBottom: "1vh",
    width: "30%"
  },
  switch: {
    marginTop: "2vh",
    fontWeight: "700"
  },
  link: {
    marginLeft: "1vh",
    textDecoration: "none"
  }
});

const Login = () => {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  // user context
  const { user, setUser } = useContext(UserContext);
  const { width, height } = useContext(SizeContext);

  const checkEmailError = () => {
    if (emailError) {
      return emailError;
    } else return null;
  };

  const checkPasswordError = () => {
    if (passwordError) {
      return passwordError;
    } else return null;
  };

  useEffect(() => {
    if (error) {
      for (let i in error) {
        if (error[i].param === "email") {
          setEmailError(error[i].msg);
        } else if (error[i].param === "password") {
          setPasswordError(error[i].msg);
        } else {
          setEmailError(null);
          setPasswordError(null);
        }
      }
    }
  }, [error]);

  // remove errors when user starts typing
  useEffect(() => {
    if (emailError) {
      setEmailError(null);
    }
  }, [email]);

  useEffect(() => {
    if (passwordError) {
      setPasswordError(null);
    }
  }, [password]);

  const submit = demo => {
    async function login(user) {
      try {
        const { data } = await axios({
          url: "/login",
          method: "post",
          headers: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify(user)
        });
        if ((data.success = true)) {
          localStorage.setItem("peercode-auth-token", data.token);
          setUser(data.user);
          socket.login(data.user._id);
        }
      } catch (err) {
        let responseBody = err.response.data;
        setError(responseBody.errors);
      }
    }

    if (demo) {
      const user = {
        email: "demouser@demo.com",
        password: "123456"
      };
      login(user);
    } else {
      const user = {
        email: email,
        password: password
      };
      login(user);
    }
  };

  const handleSubmit = e => {
    if (e.key === "Enter") {
      submit(false);
    }
  };

  // if the user is signed in, redirect them to the home page
  if (user && !user.experience) {
    return <Redirect to="/experience" />;
  } else if (user && user.experience) {
    return <Redirect to="/" />;
  } else
    return (
      <SignUpContainer>
        <Typography className={classes.text}> Sign In </Typography>
        <TextField
          className={[classes.input, width < 900 && classes.smallInput]}
          label="email address"
          variant={width < 900 ? "filled" : "outlined"}
          error={checkEmailError() ? true : false}
          helperText={emailError}
          onChange={e => {
            setEmail(e.target.value);
          }}
          onKeyPress={e => handleSubmit(e)}
        />
        <TextField
          className={[classes.input, width < 900 && classes.smallInput]}
          label="password"
          type="password"
          variant={width < 900 ? "filled" : "outlined"}
          error={checkPasswordError() ? true : false}
          helperText={passwordError}
          onChange={e => {
            setPassword(e.target.value);
          }}
          onKeyPress={e => handleSubmit(e)}
        />
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          onClick={() => submit(false)}
        >
          Login
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          onClick={() => submit(true)}
        >
          Log into Demo
        </Button>
        <Typography className={classes.switch}>
          Don't have an account?
          <Link className={classes.link} to="/signup">
            sign up
          </Link>
        </Typography>
      </SignUpContainer>
    );
};

export default Login;
