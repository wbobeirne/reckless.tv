import React from "react";
import { Route, RouteProps, Redirect } from "react-router-dom";
import { useAuthContext } from "../contexts/Auth";
import { CircularProgress, Box, Container, Paper, Typography } from "@material-ui/core";

export const AuthRoute: React.FC<RouteProps> = props => {
  const { user, isChecking } = useAuthContext();

  let component: RouteProps["component"];

  if (isChecking) {
    component = RouteLoader;
  } else if (user) {
    component = props.component;
  } else {
    component = RouteDenied;
  }

  return <Route {...props} component={component} />;
};

const RouteLoader = () => (
  <Box p={10} display="flex" alignItems="center">
    <CircularProgress size={50} />
  </Box>
);

const RouteDenied = () => <Redirect to="/login" />;
