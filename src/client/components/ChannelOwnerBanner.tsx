import React, { useCallback, useState } from "react";
import { Typography, Button, makeStyles } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { SelfLivestream, LivestreamStatus } from "../../shared/types/api";
import { api } from "../lib/api";

interface Props {
  stream: SelfLivestream;
  onUpdateStream(livestream: SelfLivestream): void;
}

export const ChannelOwnerBanner: React.FC<Props> = ({ stream, onUpdateStream }) => {
  const styles = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.updateStreamStatus(
        stream.id,
        stream.status === LivestreamStatus.live ? LivestreamStatus.offline : LivestreamStatus.live,
      );
      onUpdateStream(res);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: "error" });
    }
    setIsLoading(false);
  }, [stream, onUpdateStream]);

  return (
    <div className={styles.root}>
      <Typography noWrap className={styles.message}>
        {stream.status === LivestreamStatus.live
          ? "Your stream is currently live to the public"
          : "Your stream is currently private, no one can see it but you"}
      </Typography>
      <Button variant="contained" onClick={toggleStatus} disabled={isLoading}>
        {stream.status === LivestreamStatus.live ? "Go Offline" : "Go Live"}
      </Button>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(2),
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.shape.borderRadius,
  },
  message: {
    paddingRight: theme.spacing(2),
    color: theme.palette.primary.contrastText,
  },
}));
