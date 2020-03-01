import React from "react";
import { Toolbar, Typography, Button, makeStyles, Container, Link } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import { useAuthContext } from "../contexts/Auth";

export const Template: React.FC = ({ children }) => {
  const { user, isChecking } = useAuthContext();
  const styles = useStyles();

  return (
    <>
      <Toolbar className={styles.header} disableGutters>
        <Container maxWidth="lg" className={styles.headerInner}>
          <div className={styles.buttons}>
            <Link to="/" component={RouterLink}>
              Home
            </Link>
            <Link to="/browse" component={RouterLink}>
              Browse
            </Link>
            {user && (
              <Button
                size="small"
                variant="contained"
                to="/stream"
                disableElevation
                component={RouterLink}
              >
                Stream
              </Button>
            )}
          </div>
          <Typography className={styles.title} variant="h5" noWrap>
            Reckless.tv
          </Typography>
          <div className={styles.user}>
            {isChecking ? null : user ? (
              <Typography>Howdy, {user.username}</Typography>
            ) : (
              <>
                <Link to="/login" component={RouterLink}>
                  Log In
                </Link>
                <Button
                  variant="contained"
                  size="small"
                  to="/signup"
                  disableElevation
                  component={RouterLink}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </Container>
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
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,

    "& .MuiLink-root": {
      ...theme.typography.button,
      color: theme.palette.primary.contrastText,
    },
  },
  headerInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttons: {
    width: 240,
    "& .MuiLink-root": {
      marginRight: theme.spacing(4),
    },
  },
  user: {
    width: 240,
    textAlign: "right",

    "& .MuiLink-root": {
      marginRight: theme.spacing(3),
    },
  },
}));
