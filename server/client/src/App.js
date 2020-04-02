import React, { useState, useMemo, useEffect } from "react";
import { MuiThemeProvider } from "@material-ui/core";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { UserContext, SizeContext } from "./context";
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
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  const [userLoading, setUserLoading] = useState(true);

  const logout = () => {
    setUser(null);
    removeToken();
  };

  const handleResize = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };

  const userValue = useMemo(
    () => ({
      user: user,
      isLoading: userLoading,
      setUser: setUser,
      logout: logout
    }),
    [user, userLoading, setUser]
  );

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
      <UserContext.Provider value={userValue}>
        <SizeContext.Provider value={{ width, height }}>
          <MuiThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={4}>
              <BrowserRouter>
                <Switch>
                  <Route
                    path="/signup"
                    component={Signup}
                    signupUser={setUser}
                  />
                  <Route path="/login" component={Login} />
                  <Route path="/experience" component={Experience} />
                  <Route path="/" component={Home} />
                </Switch>
              </BrowserRouter>
            </SnackbarProvider>
          </MuiThemeProvider>
        </SizeContext.Provider>
      </UserContext.Provider>
    );
}

export default App;
