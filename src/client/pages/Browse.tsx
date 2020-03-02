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
import { FallbackCardMedia } from "../components/FallbackCardMedia";

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
      <Box pt={10} display="flex" alignItems="center" justifyContent="center" textAlign="center">
        <div>
          <Typography variant="h4" gutterBottom>
            Looks like nobody's streaming.
          </Typography>
          <Box mb={3}>
            <Typography variant="body1" color="textSecondary">
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
                <FallbackCardMedia
                  style={{ height: 180 }}
                  src={`/thumbnail/${s.livestream.id}/thumbnail.jpg?width=280&height=158&fit_mode=smartcrop`}
                  fallback="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?format=jpg&quality=90&v=1530129081"
                />
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
