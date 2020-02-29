import React, { useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Grid, Button, TextField } from "@material-ui/core";
import { SensitiveUploadField } from "./SensitiveUploadField";
import { makeFormFieldProps, blobToString } from "../util/form";
import { api } from "../lib/api";
import { useSnackbar } from "notistack";
import { useAuthContext } from "../contexts/Auth";
import { FormBox } from "./FormBox";

interface FormValues {
  grpcUrl: string;
  macaroon: string;
  cert: string;
}

interface Props {
  onSave(): void;
}

const passwordChars = "●".repeat(20);

export const NodeForm: React.FC<Props> = ({ onSave }) => {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [prefilled, setPrefilled] = useState(!!user && !!user.grpcUrl);

  const form = useFormik<FormValues>({
    initialValues: {
      grpcUrl: (user && user.grpcUrl) || "",
      macaroon: "",
      cert: "",
    },
    validateOnBlur: false,
    validationSchema: Yup.object().shape({
      grpcUrl: Yup.string().required(),
      macaroon: Yup.string().required(),
      cert: Yup.string().required(),
    }),
    onSubmit: async values => {
      try {
        await api.saveNodeConfig({
          nodeType: "lnd",
          ...values,
        });
        onSave();
      } catch (err) {
        enqueueSnackbar(err.message, { variant: "error" });
      }
    },
  });

  const handleUploadMacaroon = useCallback(
    async (file: File) => {
      const value = await blobToString(file, "hex");
      form.setFieldValue("macaroon", value);
    },
    [form],
  );

  const handleUploadCert = useCallback(
    async (file: File) => {
      const value = await blobToString(file, "base64");
      form.setFieldValue("cert", value);
    },
    [form],
  );

  return (
    <FormBox onSubmit={form.handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            {...makeFormFieldProps("grpcUrl", form)}
            label="Node gRPC Endpoint"
            variant="outlined"
            disabled={prefilled}
            required
            fullWidth
            autoFocus
          />
        </Grid>
        <Grid item xs={12}>
          <SensitiveUploadField
            {...makeFormFieldProps("macaroon", form)}
            value={prefilled ? passwordChars : form.values.macaroon}
            onUpload={handleUploadMacaroon}
            label="Invoice Macaroon"
            variant="outlined"
            disabled={prefilled}
            required
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <SensitiveUploadField
            {...makeFormFieldProps("cert", form)}
            value={prefilled ? passwordChars : form.values.cert}
            onUpload={handleUploadCert}
            label="TLS Certificate"
            variant="outlined"
            disabled={prefilled}
            required
            fullWidth
          />
        </Grid>
        {prefilled ? (
          <>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => setPrefilled(false)}
              >
                Edit
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                color="primary"
                onClick={() => onSave()}
              >
                Continue
              </Button>
            </Grid>
          </>
        ) : (
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
        )}
      </Grid>
    </FormBox>
  );
};
