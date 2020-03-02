import React, { useEffect, useState } from "react";
import { Container, Paper, Box, Typography, Grid, Link, Button } from "@material-ui/core";
import { Link as RouterLink } from "react-router-dom";
import { SelfLivestream } from "../../shared/types/api";
import { CopyField } from "./CopyField";
import { StreamPlayer } from "./StreamPlayer";
import { useAuthContext } from "../contexts/Auth";

interface Props {
  stream: SelfLivestream | null;
  goToStreamSelect(): void;
}

export const BroadcastInstructions: React.FC<Props> = ({ stream, goToStreamSelect }) => {
  const { user } = useAuthContext();
  const [didStream, setDidStream] = useState(false);

  useEffect(() => {
    if (!stream) {
      goToStreamSelect();
    }
  }, [stream, goToStreamSelect]);

  if (!stream) {
    return null;
  }

  return (
    <Container maxWidth="sm" style={{ maxWidth: 650 }}>
      <Paper>
        <Box p={4}>
          <Box mb={2}>
            <Typography variant="h5" align="center">
              You're Ready to Start Streaming!
            </Typography>
          </Box>
          <Typography>
            Grab your favorite software, and punch in the RTMP values below to start streaming. The
            video below will automatically start playing once we start receiving video. This may
            take up to a minute.
          </Typography>
          <Box pt={2} pb={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StreamPlayer
                  stream={stream}
                  onReady={() => setDidStream(true)}
                  controls={false}
                  token={{
                    id: `${Math.random()}`,
                    token: stream.playbackId,
                    expiresAt: new Date(Date.now() + 50000000000).toISOString(),
                    createdAt: new Date().toISOString(),
                  }}
                  playing
                  muted
                  autoRetry
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <CopyField
                      fullWidth
                      variant="outlined"
                      label="RTMP Server"
                      value="rtmps://global-live.mux.com/app"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CopyField
                      fullWidth
                      variant="outlined"
                      label="Stream Key"
                      value={stream.streamKey}
                      helperText="Make sure you keep this private"
                    />
                  </Grid>
                </Grid>
              </Grid>
              {user && (
                <Grid item xs={12}>
                  <Button
                    component={RouterLink}
                    to={`/channel/${user.username}`}
                    disabled={!didStream}
                    variant="contained"
                    size="large"
                    color="primary"
                    fullWidth
                  >
                    {didStream ? "Go to Your Channel" : "Start Streaming to Continue"}
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>
          <Typography variant="body2">
            Not sure how to get started? We recommend you download{" "}
            <Link href="https://obsproject.com/" target="_blank" rel="noopener nofollow">
              OBS (Open Broadcaster Software)
            </Link>{" "}
            and follow the FAQs below to get started.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};
