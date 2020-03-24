import React from "react";
import { Grid, Typography, makeStyles } from "@material-ui/core";
import { levels } from "utils";
import EditIcon from "@material-ui/icons/Edit";
import { Link } from "react-router-dom";

const useStyles = makeStyles({
  expContainer: {
    border: "1px solid #6E3ADB",
    boxShadow: "1px 2px 8px #6E3ADB",
    padding: "1vh 2vh 2vh"
  },
  editContainer: {
    margin: "0 0 18px 0"
  },
  languageIcon: {
    fontSize: "9vh"
  },
  level: {
    fontSize: "2em"
  },
  link: {
    color: "#888888",
    "&:hover": {
      color: "black"
    }
  }
});

const ProfileExperience = ({ experience, editable }) => {
  const classes = useStyles();
  return (
    <Grid container className={classes.expContainer} justify="center">
      <Grid container item>
        {editable ? (
          <Grid
            item
            className={classes.editContainer}
            container
            justify="flex-end"
            xs={12}
          >
            <Grid item>
              <Link to="/experience" className={classes.link}>
                <EditIcon />
              </Link>
            </Grid>
          </Grid>
        ) : (
          <div></div>
        )}
      </Grid>
      <Grid container item spacing={5} justify="space-around">
        {experience.map((exp, index) => (
          <Grid item xs={12} sm={8} md={6} lg={3} key={index}>
            <i
              className={`${
                Object.keys(exp)[0] === "C++"
                  ? `devicon-cplusplus-plain`
                  : `devicon-${Object.keys(exp)[0].toLowerCase()}-plain`
              } colored ${classes.languageIcon}`}
            ></i>
            <Typography className={classes.level}>
              {levels[exp[Object.keys(exp)[0]] - 1]}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default ProfileExperience;
