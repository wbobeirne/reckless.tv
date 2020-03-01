import React from "react";
import { User, Livestream } from "../lib/api";
import { Box, makeStyles, Typography } from "@material-ui/core";

interface Props {
  user: User;
  livestream: Livestream;
}

export const ChannelInfo: React.FC<Props> = ({ user, livestream }) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <div className={styles.channel}>
        <Typography variant="h6">{livestream.title}</Typography>
        <Typography variant="body2">{livestream.description}</Typography>
      </div>
      <div className={styles.stats}>
        <Typography variant="overline">0 viewers</Typography>
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
  },
  channel: {
    paddingRight: theme.spacing(4),
  },
  stats: {},
  stat: {
  },
}));
