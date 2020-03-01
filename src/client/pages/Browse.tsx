import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Grid,
  Typography,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Box,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import { api, LivestreamList } from "../lib/api";

export const Browse: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [streams, setStreams] = useState<LivestreamList | null>(null);

  useEffect(() => {
    api
      .getLivestreams()
      .then(setStreams)
      .catch(err => {
        enqueueSnackbar(err.message, { variant: "error" });
      });
  }, []);

  if (!streams) {
    return <CircularProgress />;
  }

  if (!streams.length) {
    return (
      <Box p={5} display="flex" alignItems="center" justifyContent="center" textAlign="center">
        <div>
          <Typography variant="h3" gutterBottom>
            Looks like nobody's streaming.
          </Typography>
          <Box mb={3}>
            <Typography variant="h5" color="textSecondary">
              Why not be the first to get this party started?
            </Typography>
          </Box>
          <Button to="/stream" component={Link} size="large" variant="contained" color="primary">
            Start a Stream
          </Button>
        </div>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {streams.map(s => (
        <Grid key={s.user.id} item xs={12} sm={6} md={4}>
          <Card>
            <Link to={`/channel/${s.user.username}`}>
              <CardActionArea>
                <CardMedia></CardMedia>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {s.livestream.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    {s.livestream.description || <em>No description</em>}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Link>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
