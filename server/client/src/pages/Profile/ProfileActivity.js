import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  makeStyles
} from "@material-ui/core";
import { Link } from "react-router-dom";
import axios from "axios";
import { authHeader } from "functions/jwt";
import coding from "assets/images/coding.jpeg";
import codeRequest from "assets/images/codeRequest.jpeg";
import { Rating } from "@material-ui/lab";

const useStyles = makeStyles({
  root: {
    minHeight: "17vh"
  },
  paper: {
    minHeight: "75vh",
    textAlign: "center",
    padding: "3vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  link: {
    textDecoration: "none"
  },
  media: {
    height: "400px",
    width: "400px",
    margin: "auto"
  },
  cardImg: {
    margin: "auto"
  }
});

const ProfileActivity = ({ ownProfile, userId, user }) => {
  const [numRequests, setNumRequests] = useState(0);
  const [numReviews, setNumReviews] = useState(0);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const getActivity = async () => {
      if (!ownProfile) {
        const { data } = await axios.get(
          `/user/${userId}/activity`,
          authHeader()
        );
        setRating(data.rating);
        setNumRequests(data.requests);
        setNumReviews(data.reviews);
      }
    };
    getActivity();
  });

  const classes = useStyles();
  const ownProfileDisplay = () => {
    if (ownProfile) {
      return (
        <Grid container direction="column" justify="center" spacing={4}>
          <Grid item>
            <Typography variant="h4">Activity</Typography>
          </Grid>
          <Grid item>
            <Card className={classes.root}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  My Rating
                </Typography>
                <Typography variant="h6" component="h3">
                  {user.rating.averageRating}
                </Typography>
                <Rating
                  value={user.rating.averageRating}
                  name="disabled"
                  disabled
                  precision={0.25}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid container justify="space-around">
            <Grid item xs={12} md={6}>
              <Link to="/dashboard/reviews" className={classes.link}>
                <Card className={classes.root}>
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h2">
                        My Reviews
                      </Typography>
                    </CardContent>
                    <CardMedia
                      className={classes.media}
                      image={coding}
                      title="Reviews"
                    />
                  </CardActionArea>
                </Card>
              </Link>
            </Grid>
            <Grid item xs={12} md={6}>
              <Link to="/dashboard/requests" className={classes.link}>
                <Card className={classes.root}>
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h2">
                        My Requests
                      </Typography>
                    </CardContent>
                    <CardMedia
                      className={classes.media}
                      image={codeRequest}
                      title="Reviews"
                    />
                  </CardActionArea>
                </Card>
              </Link>
            </Grid>
          </Grid>
        </Grid>
      );
    } else {
      return (
        <Grid container spacing={4} justify="center">
          <Typography variant="h4"> Activity </Typography>
          <Grid container item justify="space-around">
            <Grid item xs={12} md={4}>
              <Card className={classes.root}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    Rating
                  </Typography>
                  <Typography gutterBottom variant="h5" component="h2">
                    {rating}
                  </Typography>
                  <Rating
                    value={rating}
                    precision={0.25}
                    disabled
                    name="disabled"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className={classes.root}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    Reviews
                  </Typography>
                  <Typography gutterBottom variant="h5" component="h2">
                    {numReviews}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card className={classes.root}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    Requests
                  </Typography>
                  <Typography gutterBottom variant="h5" component="h2">
                    {numRequests}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      );
    }
  };

  return ownProfileDisplay();
};

export default ProfileActivity;
