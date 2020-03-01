import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CircularProgress, Grid, makeStyles } from "@material-ui/core";
import { StreamPlayer } from "../components/StreamPlayer";
import { api, User, Livestream, SelfLivestream } from "../lib/api";
import { StreamChat } from "../components/StreamChat";
import { ChannelInfo } from "../components/ChannelInfo";
import { ChannelOwnerBanner } from "../components/ChannelOwnerBanner";

const isSelfLivestream = (ls: Livestream | SelfLivestream): ls is SelfLivestream =>
  !!(ls as SelfLivestream).streamKey;

export const Channel: React.FC = () => {
  const styles = useStyles();
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [livestream, setLivestream] = useState<Livestream | SelfLivestream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }
    api
      .getUserLivestream(username)
      .then(res => {
        setUser(res.user);
        setLivestream(res.livestream || null);
      })
      .catch(err => {
        setError(error);
      });
  }, [username]);

  if (!user && !error) {
    return <CircularProgress />;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  if (!user) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      {livestream && isSelfLivestream(livestream) && (
        <Grid item xs={12}>
          <ChannelOwnerBanner stream={livestream} onUpdateStream={setLivestream} />
        </Grid>
      )}
      <Grid item xs={12} md={9}>
        {livestream ? (
          <StreamPlayer stream={livestream} controls muted playing />
        ) : (
          <h1>{user.username} has no stream</h1>
        )}
      </Grid>
      <Grid item xs={12} md={3} className={styles.chatColumn}>
        <StreamChat />
      </Grid>
      {livestream && (
        <Grid item xs={12} md={8} lg={9}>
          <ChannelInfo user={user} livestream={livestream} />
        </Grid>
      )}
    </Grid>
  );
};

const useStyles = makeStyles(() => ({
  chatColumn: {
    display: "flex",
    flexDirection: "column",
  },
}));
