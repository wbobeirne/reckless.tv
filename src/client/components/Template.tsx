import React from "react";
import { Toolbar, Typography, Button, makeStyles, Container } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useAuthContext } from "../contexts/Auth";

export const Template: React.FC = ({ children }) => {
  const { user, isChecking } = useAuthContext();
  const styles = useStyles();

  return (
    <>
      <Toolbar className={styles.header}>
        <div style={{ width: 280 }}>
          <Link to="/">
            <Button size="small">Home</Button>
          </Link>
          <Link to="/browse">
            <Button size="small">Browse</Button>
          </Link>
          <Link to="/stream">
            <Button size="small" variant="contained" color="primary">
              Stream
            </Button>
          </Link>
        </div>
        <Typography className={styles.title} variant="h5" noWrap>
          Reckless.tv
        </Typography>
        <div style={{ width: 280, textAlign: "right" }}>
          {isChecking ? null : user ? (
            <Typography>Howdy, {user.username}</Typography>
          ) : (
            <>
              <Link to="/login">
                <Button size="small">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outlined" size="small">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </Toolbar>
      <Container maxWidth="lg">{children}</Container>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  title: {
    flex: 1,
    textAlign: "center",
  },
  header: {
    marginBottom: theme.spacing(2),
  },
}));
