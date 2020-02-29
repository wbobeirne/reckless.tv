import React, { useEffect, useCallback, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Grid, TextField, Button, Box, CircularProgress, ButtonBase, Typography, List, ListItem } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { FormBox } from "./FormBox";
import { makeFormFieldProps } from "../util/form";
import { api, Livestream } from "../lib/api";

interface FormValues {
  title: string;
  description: string;
}

interface Props {
  onSelectStream(stream: Livestream): void;
}

export const StreamForm: React.FC<Props> = ({ onSelectStream }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [streams, setStreams] = useState<Livestream[] | null>(null);
  const [isCreatingStream, setIsCreatingStream] = useState(false);

  const form = useFormik<FormValues>({
    initialValues: {
      title: "",
      description: "",
    },
    validateOnBlur: false,
    validationSchema: Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
    }),
    onSubmit: async values => {
      try {
        const stream = await api.createStream(values);
        onSelectStream(stream);
      } catch (err) {
        enqueueSnackbar(err.message, { variant: "error" });
      }
    },
  });

  const fetchStreams = useCallback(() => {
    return api
      .getSelfLivestreams()
      .then(res => {
        console.log(res);
        setStreams(res);
        setIsCreatingStream(!res.length);
      })
      .catch(err => {
        enqueueSnackbar(err.message, { variant: "error" });
      });
  }, []);

  useEffect(() => {
    fetchStreams();
  }, []);

  let content;
  if (!streams) {
    content = (
      <Box p={4} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  } else if (isCreatingStream) {
    content = (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            {...makeFormFieldProps("title", form)}
            label="Title"
            variant="outlined"
            required
            fullWidth
            autoFocus
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...makeFormFieldProps("description", form)}
            label="Description"
            placeholder="Limit 80 chars"
            variant="outlined"
            rows={3}
            required
            multiline
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            color="primary"
            variant="contained"
            size="large"
            type="submit"
            disabled={form.isSubmitting}
            fullWidth
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    );
  } else {
    content = (
      <>
        <Typography variant="h5">Select a Stream</Typography>
        <List>
          {streams.map(s => (
            <ListItem key={s.id} button onClick={() => onSelectStream(s)}>

            </ListItem>
          ))}
        </List>
        <Button variant="contained" size="large" onClick={() => setIsCreatingStream(true)}>
          Create a New Stream
        </Button>
      </>
    )
  }
  return <FormBox onSubmit={form.handleSubmit}>{content}</FormBox>;
};
