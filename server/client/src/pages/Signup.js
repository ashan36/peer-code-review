import React, { useState, useEffect, useContext } from "react";
import { Link, Redirect } from "react-router-dom";
import { Button, TextField, Typography, makeStyles } from "@material-ui/core";
import { SignUpContainer } from "components";
import { UserContext, SizeContext } from "context";
import axios from "axios";

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
    marginBottom: "2vh"
  },
  button: {
    backgroundColor: "#43DDC1",
    marginLeft: "30%",
    marginRight: "30%",
    marginTop: "2vh",
    marginBottom: "2vh",
    width: "30%"
  },
  switch: {
    marginTop: "2vh",
    fontWeight: "700"
  },
  link: {
    marginLeft: "1vh",
    textDecoration: "none"
  },
  mobileLink: {
    color: "#43DDC1"
  }
});

const Signup = () => {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  // user context
  const { user, setUser } = useContext(UserContext);
  const { width, height } = useContext(SizeContext);

  const validateEmail = () => {
    if (emailError) {
      return emailError;
    } else if (email === "") {
      return false;
    } else return !/\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = () => {
    if (passwordError) {
      return passwordError;
    } else if (password.length > 5 || password.length === 0) {
      return null;
    } else return "password must be at least 6 characters";
  };

  const validateSecondPassword = () => {
    if (confirmPasswordError) {
      return confirmPasswordError;
    } else if (secondPassword === password || secondPassword === "") {
      return null;
    } else return "passwords must match";
  };

  useEffect(() => {
    if (error) {
      for (let i in error) {
        if (error[i].param === "email") {
          setEmailError(error[i].msg);
        } else if (error[i].param === "name") {
          setNameError(error[i].msg);
        } else if (error[i].param === "password") {
          setPasswordError(error[i].msg);
        } else if (error[i].param === "confirmPassword") {
          setConfirmPasswordError(error[i].msg);
        } else {
          setEmailError(null);
          setNameError(null);
          setPasswordError(null);
          setConfirmPasswordError(null);
        }
      }
    }
  }, [error]);

  const submit = () => {
    async function signup() {
      try {
        let { data } = await axios({
          url: "/signup",
          method: "post",
          headers: {
            "Content-Type": "application/json"
          },
          data: {
            email: email,
            name: name,
            password: password,
            confirmPassword: secondPassword
          }
        });
        if ((data.success = true)) {
          localStorage.setItem("peercode-auth-token", data.token);
          setUser(data.user);
        }
      } catch (err) {
        let responseBody = err.response.data;
        setError(responseBody.errors);
      }
    }

    signup();
  };

  // if the user is signed in, redirect them to the add experience page
  if (user) {
    return <Redirect to="/" />;
  } else
    return (
      <SignUpContainer>
        <Typography className={classes.text}> Create An Account </Typography>
        <TextField
          className={[classes.input, width < 900 && classes.smallInput]}
          label="email address"
          variant={width < 900 ? "filled" : "outlined"}
          error={validateEmail()}
          helperText={emailError}
          onChange={e => {
            setEmail(e.target.value);
          }}
        />
        <TextField
          className={[classes.input, width < 900 && classes.smallInput]}
          label="name"
          variant={width < 900 ? "filled" : "outlined"}
          error={nameError ? true : false}
          helperText={nameError}
          onChange={e => {
            setName(e.target.value);
          }}
        />
        <TextField
          className={[classes.input, width < 900 && classes.smallInput]}
          label="password"
          type="password"
          variant={width < 900 ? "filled" : "outlined"}
          error={validatePassword() ? true : false}
          helperText={validatePassword()}
          onChange={e => {
            setPassword(e.target.value);
          }}
        />
        <TextField
          className={[classes.input, width < 900 && classes.smallInput]}
          label="re-enter password"
          type="password"
          variant={width < 900 ? "filled" : "outlined"}
          error={validateSecondPassword() ? true : false}
          helperText={validateSecondPassword()}
          onChange={e => {
            setSecondPassword(e.target.value);
          }}
        />
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          onClick={submit}
        >
          Sign Up
        </Button>
        <Typography className={classes.switch}>
          Already have an account?
          <Link
            className={`${classes.link} ${width < 900 && classes.mobileLink}`}
            to="/login"
          >
            login
          </Link>
        </Typography>
      </SignUpContainer>
    );
};

export default Signup;
