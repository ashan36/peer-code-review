import React, { useState, useContext } from "react";
import { UserContext } from "context/UserContext";
import ExperienceContainer from "components/SignUpContainer";
import NewExperienceForm from "./NewExperienceForm";
import { availableLanguages } from "utils";
import { Grid, Button, Typography, makeStyles } from "@material-ui/core";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import axios from "axios";
import { authHeader } from "functions/jwt";

const useStyles = makeStyles({
  text: {
    fontSize: "3vw",
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
  add: {
    color: "#43DDC1",
    fontSize: "3vw",
    cursor: "pointer",
    marginTop: "1vh"
  },
  success: {
    color: "#43DDC1",
    fontSize: "2vw"
  },
  experienceCard: {
    rounded: true,
    backgroundColor: "#F0F0F0"
  }
});
const Experience = ({ history }) => {
  const classes = useStyles();
  const { user, setUser } = useContext(UserContext);
  const defaultExperiences = [];

  // Set default experience shown to whatever user currently has on database
  if (user && user.experience) {
    for (let key in user.experience) {
      defaultExperiences.push({ [key]: user.experience[key] });
    }
    defaultExperiences.sort(
      (a, b) => a[Object.keys(a)[0]] - b[Object.keys(b)[0]]
    );
  } else {
    defaultExperiences.push({ C: 1 });
  }
  const [experience, setExperience] = useState(defaultExperiences);
  const [successful, setSuccessful] = useState(false);

  // Put language keys from state into knownLanguages object
  const knownLanguages = {};
  experience.forEach(ele => {
    // Set key to true if language is in experience object
    knownLanguages[Object.keys(ele)[0]] = true;
  });
  // Filter all available languages list for elements not in known languages object
  const newUnselectedLanguages = availableLanguages.filter(ele => {
    return !knownLanguages.hasOwnProperty(ele);
  });

  const addExperience = () => {
    if (experience.length < availableLanguages.length) {
      setExperience([...experience, { [newUnselectedLanguages[0]]: 1 }]);
    }
  };

  const updateExperience = async (index, newExperience) => {
    let newExperienceList = experience.slice();
    newExperienceList[index] = newExperience;
    setExperience(newExperienceList);
  };

  const deleteExperience = idx => {
    let newExperienceList = experience.slice();
    newExperienceList.splice(idx, 1);
    setExperience(newExperienceList);
  };

  const handleSubmit = async () => {
    let experienceToSubmit = {};
    // Flatten array of objects into single object
    experience.forEach(ele => {
      // Object.keys(ele)[0] is they key for each experience, set experience to submit at that key in
      // experienceToSubmt object
      const key = Object.keys(ele)[0];
      experienceToSubmit[key] = ele[key];
    });
    // TO-DO, use context for user ID instead of hardcoding
    const { data } = await axios.put(
      `user/${user._id}/experience`,
      experienceToSubmit,
      authHeader()
    );
    setSuccessful(data.message);
    setUser({ ...user, experience: experienceToSubmit });
    history.push("/");
  };

  return (
    <ExperienceContainer>
      <Grid container spacing={1} direction="column" justify="space-evenly">
        <Grid item xs={12}>
          <Typography className={classes.text}>
            Add your experience here
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={3} direction="column" justify="space-evenly">
            {experience.map((ele, idx) => {
              const currLanguage = Object.keys(experience[idx])[0];
              return (
                <Grid item key={currLanguage}>
                  <NewExperienceForm
                    updateExperience={updateExperience}
                    language={currLanguage}
                    level={ele[currLanguage]}
                    availableLanguages={newUnselectedLanguages}
                    deleteExperience={deleteExperience}
                    index={idx}
                    experience={experience}
                    deletable={experience.length > 1}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Grid>
        {/* <Grid className={classes.buttonContainer}> */}
        {experience.length < availableLanguages.length && (
          <Grid item>
            <AddCircleOutlineOutlinedIcon
              className={classes.add}
              onClick={addExperience}
            />
          </Grid>
        )}
        <Grid item xs={12}>
          <Button
            className={classes.button}
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            Submit
          </Button>
        </Grid>
      {/* if user updates successfully, show message for 5 seconds */}


      </Grid>
    </ExperienceContainer>
  );
};

export default Experience;
