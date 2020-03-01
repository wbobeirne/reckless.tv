import React from "react";
import { render } from "react-dom";
import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { hot } from "react-hot-loader/root";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "./contexts/Auth";
import { Template } from "./components/Template";
import { AuthRoute } from "./components/AuthRoute";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Browse } from "./pages/Browse";
import { CreateStream } from "./pages/CreateStream";
import { Channel } from "./pages/Channel";
import { theme } from "./theme";

const root = document.getElementById("root");

const App: React.FC = hot(() => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <SnackbarProvider anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
            <AuthProvider>
              <Template>
                <Switch>
                  <Route exact path="/" component={Home} />
                  <Route exact path="/login" component={Login} />
                  <Route exact path="/signup" component={Signup} />
                  <Route exact path="/browse" component={Browse} />
                  <AuthRoute exact path="/stream" component={CreateStream} />
                  <Route exact path="/channel/:username" component={Channel} />
                  <Redirect from="/" to="/" />
                </Switch>
              </Template>
            </AuthProvider>
          </SnackbarProvider>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
});

render(<App />, root);
