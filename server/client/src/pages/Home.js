import React, { useContext } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { UserContext } from "context/UserContext";
import { NavBar } from "components";
import CodeUpload from "./CodeUpload";
import Dashboard from "./Dashboard";
import Balance from "./Balance";
import MyProfile from "./MyProfile";
import Profile from "pages/Profile";

const Home = () => {
  // user context
  const { user, isLoading } = useContext(UserContext);

  if (!user && !isLoading) {
    return <Redirect to="/login" />;
  } else if (user && !user.experience) {
    // if the user has no experience set, redirect
    return <Redirect to="/experience" />;
  } else
    return (
      <>
        <NavBar></NavBar>
        <Switch>
          <Route path="/balance" component={Balance} />
          <Route path="/code-upload" component={CodeUpload} />
          <Route
            path="/dashboard/:typeParam/:threadParam"
            children={<Dashboard />}
          />
          <Route path="/dashboard/:typeParam" children={<Dashboard />} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile/:userId" component={Profile} />
          <Route exact path="/" component={MyProfile} />
        </Switch>
      </>
    );
};

export default Home;
