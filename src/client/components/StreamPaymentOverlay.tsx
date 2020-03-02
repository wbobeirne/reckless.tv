import React, { useCallback, useState } from "react";
import { makeStyles, Typography, Grid, Box, Button } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { requestProvider } from "webln";
import { Livestream, User } from "../lib/api";
import { useAuthContext } from "../contexts/Auth";
import { useChannelPaymentContext } from "../contexts/ChannelPayment";

interface Props {
  streamer: User;
  stream: Livestream;
}

export const StreamPaymentOverlay: React.FC<Props> = ({ streamer, stream }) => {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const { requestPayment } = useChannelPaymentContext();
  const styles = useStyles();
  const [isPaying, setIsPaying] = useState(false);

  const handlePayPerMinute = useCallback(async () => {
    setIsPaying(true);
    requestPayment(50, true);
    setIsPaying(false);
  }, []);

  const handleDayPass = useCallback(async () => {
    setIsPaying(true);
    requestPayment(10000);
    setIsPaying(false);
  }, []);

  // A good honest paying viewer (or self)
  if (user && stream.playbackId) {
    return null;
  }

  let content;
  if (!user) {
    content = (
      <>
        <Typography variant="h4" gutterBottom>
          Log in to watch this stream
        </Typography>
        <Typography variant="body1">You must login to watch Reckless.tv streams</Typography>
      </>
    );
  } else {
    content = (
      <>
        <Typography variant="h4" gutterBottom>
          Get Access to the Stream
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Support {streamer.username} by paying with Lightning.
          <br />
          All funds go directly to the streamer's node.
        </Typography>
        <Box mt={6}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Pay as You Go</Typography>
              <div className={styles.amount}>
                <small>for</small> 50 sats <small>/ minute</small>
              </div>
              <Typography variant="body2">Pay per minute with Joule allowances</Typography>
              <Button
                className={styles.payButton}
                variant="contained"
                color="primary"
                size="large"
                disabled={isPaying}
                onClick={handlePayPerMinute}
              >
                Start now
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Watch All Day</Typography>
              <div className={styles.amount}>
                <small>for</small> 10,000 sats
              </div>
              <Typography variant="body2">A 24 hour pass for high rollers</Typography>
              <Button
                className={styles.payButton}
                variant="contained"
                color="primary"
                size="large"
                disabled={isPaying}
                onClick={handleDayPass}
              >
                Get the Pass
              </Button>
            </Grid>
          </Grid>
        </Box>
      </>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div>{content}</div>
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    paddingTop: "56.25%",
    background: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
  },
  inner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: theme.spacing(4),

    "& > div": {
      width: "100%",
      maxWidth: 600,
      margin: "0 auto",
    },
  },
  amount: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: theme.spacing(1),

    "& small": {
      fontSize: 12,
      color: theme.palette.text.secondary,
    },
  },
  payButton: {
    width: "100%",
    maxWidth: 220,
    marginTop: theme.spacing(2),
  },
  [theme.breakpoints.down("sm")]: {
    root: {
      paddingTop: 0,
    },
    inner: {
      position: "relative",
    },
  },
}));
