import React, { useCallback } from "react";
import { TextField, InputAdornment, IconButton, OutlinedTextFieldProps } from "@material-ui/core";
import { useSnackbar } from "notistack";
import CopyToClipboard from "react-copy-to-clipboard";
import FileCopyIcon from "@material-ui/icons/FileCopy";

interface Props extends Omit<OutlinedTextFieldProps, "onChange" | "value"> {
  label: string;
  value: string;
}

export const CopyField: React.FC<Props> = props => {
  const { enqueueSnackbar } = useSnackbar();

  const onCopy = useCallback(() => {
    enqueueSnackbar(`Copied ${props.label} to clipboard`, {
      variant: "success",
      autoHideDuration: 2000,
    });
  }, [enqueueSnackbar, props.label]);

  return (
    <TextField
      {...props}
      InputProps={{
        readOnly: true,
        endAdornment: (
          <InputAdornment position="end">
            <CopyToClipboard text={props.value} onCopy={onCopy}>
              <IconButton>
                <FileCopyIcon />
              </IconButton>
            </CopyToClipboard>
          </InputAdornment>
        ),
      }}
    />
  );
};
