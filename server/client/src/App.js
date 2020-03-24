import React, { useState, useMemo, useEffect } from "react";
import { MuiThemeProvider } from "@material-ui/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { UserContext } from "./context/UserContext";
import { authJWT, removeToken } from "./functions/jwt";
import { SnackbarProvider } from "notistack";
import { theme } from "./themes/theme";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Experience from "./pages/Experience";
import Home from "./pages/Home";
import Loading from "./components/Loading";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const logout = () => {
    setUser(null);
    removeToken();
  };

  const value = useMemo(
    () => ({
      user: user,
      isLoading: userLoading,
      setUser: setUser,
      logout: logout
    }),
    [user, userLoading, setUser]
  );

  // On mount, check local token for user
  useEffect(() => {
    async function getUser() {
      setUserLoading(true);
      let user = await authJWT();
      setUser(user);
      setUserLoading(false);
    }
    getUser();
  }, []);

  // placeholder loading component
  if (userLoading) {
    return <Loading />;
  } else
    return (
      <UserContext.Provider value={value}>
        <MuiThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={4}>
            <BrowserRouter>
              <Switch>
                <Route path="/signup" component={Signup} signupUser={setUser} />
                <Route path="/login" component={Login} />
                <Route path="/experience" component={Experience} />
                <Route path="/" component={Home} />
              </Switch>
            </BrowserRouter>
          </SnackbarProvider>
        </MuiThemeProvider>
      </UserContext.Provider>
    );
}

export default App;
