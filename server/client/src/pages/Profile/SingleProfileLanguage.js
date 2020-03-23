import React, { useState } from "react";
import { Grid, Typography, makeStyles } from "@material-ui/core";
import { levels } from "utils";
import IndeterminateCheckBoxRoundedIcon from "@material-ui/icons/IndeterminateCheckBoxRounded";
import AddBoxRoundedIcon from "@material-ui/icons/AddBoxRounded";

const SingleProfileLanguage = ({ experience, classes, exp }) => {
  const [counter, setCounter] = useState(exp[1] - 1);

  const handleAdd = () => {
    const addToCounter = counter + 1;
    setCounter(addToCounter);
  };

  const handleSubtract = () => {
    const subtractFromCounter = counter - 1;
    setCounter(subtractFromCounter);
  };

  return (
    <Grid container xs={12} sm={6} md={4} lg={4} key={exp[0]} justify="center">
      <Grid item>
        <i
          className={`${
            exp[0] === "C++"
              ? `devicon-cplusplus-plain`
              : `devicon-${exp[0].toLowerCase()}-plain`
          } colored ${classes.languageIcon}`}
        ></i>
      </Grid>
      <Grid container item justify="center" alignItems="center">
        <Grid item xs={1}>
          {counter > 0 ? (
            <IndeterminateCheckBoxRoundedIcon onClick={handleSubtract} />
          ) : (
            <div></div>
          )}
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.level}>{levels[counter]}</Typography>
        </Grid>
        <Grid item xs={1}>
          {counter < 3 ? (
            <AddBoxRoundedIcon onClick={handleAdd} />
          ) : (
            <div></div>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default SingleProfileLanguage;
