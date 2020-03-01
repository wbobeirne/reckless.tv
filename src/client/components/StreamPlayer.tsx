import React, { useState, useEffect, useCallback } from "react";
import ReactPlayer, { ReactPlayerProps } from "react-player";
import { Livestream } from "../../shared/types/api";
import { Typography, makeStyles } from "@material-ui/core";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import PortableWifiOffIcon from "@material-ui/icons/PortableWifiOff";
import BlockIcon from '@material-ui/icons/Block';

interface Props extends ReactPlayerProps {
  stream: Livestream;
  autoRetry?: boolean;
}

export const StreamPlayer: React.FC<Props> = ({ stream, autoRetry, ...props }) => {
  const styles = useStyles();
  const [playerKey, setPlayerKey] = useState(Math.random());
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const handleError = useCallback((err: any, data: any) => {
    if (autoRetry) {
      setTimeout(() => {
        setPlayerKey(Math.random());
      }, 3000);
    } else {
      // Offline stream
      if (data && data.networkDetails && data.networkDetails.status === 412) {
        setOffline(true);
      } else {
        setError(err);
      }
    }
  }, []);

  useEffect(() => {
    if (!stream.playbackId) {
      return setError("You do not have permission to view this stream");
    }
  }, [stream]);

  let content;
  if (!stream.playbackId) {
    content = (
      <div className={styles.error}>
        <BlockIcon />
        <Typography>You do not have access to this stream</Typography>
      </div>
    )
  }
  else if (error) {
    content = (
      <div className={styles.error}>
        <ErrorOutlineIcon />
        <Typography>{error}</Typography>
      </div>
    );
  } else if (offline) {
    content = (
      <div className={styles.error}>
        <PortableWifiOffIcon />
        <Typography>Channel is offline</Typography>
      </div>
    );
  } else {
    content = (
      <ReactPlayer
        key={playerKey}
        className={styles.player}
        onError={handleError}
        url={`https://stream.mux.com/${stream.playbackId}.m3u8`}
        width="100%"
        height="100%"
        {...props}
      />
    );
  }

  return <div className={styles.root}>{content}</div>;
};

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    paddingTop: "56.25%",
    background: "#222",
  },
  player: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  error: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "80%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    color: theme.palette.primary.contrastText,
    opacity: 0.5,

    "& .MuiSvgIcon-root": {
      fontSize: 48,
    },
  },
}));
