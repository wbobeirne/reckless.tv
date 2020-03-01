import React, { useEffect, useCallback, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Grid, TextField, Button, Box, CircularProgress } from "@material-ui/core";
import { useSnackbar } from "notistack";
import { FormBox } from "./FormBox";
import { makeFormFieldProps } from "../util/form";
import { api, SelfLivestream } from "../lib/api";

interface FormValues {
  title: string;
  description: string;
}

interface Props {
  onSelectStream(stream: SelfLivestream): void;
}

export const StreamForm: React.FC<Props> = ({ onSelectStream }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [stream, setStream] = useState<SelfLivestream | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useFormik<FormValues>({
    initialValues: {
      title: "",
      description: "",
    },
    validateOnBlur: false,
    validationSchema: Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string(),
    }),
    onSubmit: async values => {
      try {
        let res;
        if (stream) {
          res = await api.editStream(stream.id, values);
        } else {
          res = await api.createStream(values);
        }
        onSelectStream(res);
      } catch (err) {
        enqueueSnackbar(err.message, { variant: "error" });
      }
    },
  });

  const fetchStreams = useCallback(() => {
    return api
      .getSelfLivestream()
      .then(res => {
        setStream(res.livestream || null);
        setIsLoading(false);
      })
      .catch(err => {
        enqueueSnackbar(err.message, { variant: "error" });
      });
  }, []);

  useEffect(() => {
    fetchStreams();
  }, []);

  useEffect(() => {
    if (stream && !form.values.title) {
      form.setValues({ title: stream.title, description: stream.description });
    }
  }, [stream, form]);

  let content;
  if (isLoading) {
    content = (
      <Box p={4} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  } else {
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
            {!!stream ? "Continue" : "Save"}
          </Button>
        </Grid>
      </Grid>
    );
  }
  return <FormBox onSubmit={form.handleSubmit}>{content}</FormBox>;
};
