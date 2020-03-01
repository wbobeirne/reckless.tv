import React from "react";
import {
  Typography,
  Button,
  makeStyles,
  Grid,
  TextField,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { api } from "../lib/api";
import { makeFormFieldProps } from "../util/form";
import { useAuthContext } from "../contexts/Auth";
import { useSnackbar } from "notistack";
import { FormBox } from "../components/FormBox";

interface FormValues {
  username: string;
  password: string;
}

export const Signup: React.FC = () => {
  const { setUser } = useAuthContext();
  const styles = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const form = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validateOnBlur: false,
    validationSchema: Yup.object().shape({
      username: Yup.string()
        .required()
        .min(3),
      password: Yup.string()
        .required()
        .min(8),
    }),
    onSubmit: async values => {
      try {
        const user = await api.signup(values);
        setUser(user);
        history.push("/");
      } catch (err) {
        enqueueSnackbar(err.message, { variant: "error" });
      }
    },
  });

  return (
    <FormBox onSubmit={form.handleSubmit}>
      <Typography component="h1" variant="h5" className={styles.title}>
        Sign up
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            {...makeFormFieldProps("username", form)}
            label="Username"
            variant="outlined"
            required
            fullWidth
            autoFocus
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...makeFormFieldProps("password", form)}
            label="Password"
            type="password"
            variant="outlined"
            required
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
    </FormBox>
  );
};

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4),
  },
  title: {
    textAlign: "center",
    marginBottom: theme.spacing(4),
  },
}));
