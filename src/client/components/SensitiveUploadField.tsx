import React, { useState, useCallback } from "react";
import { TextField, InputAdornment, IconButton, OutlinedTextFieldProps } from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import PublishIcon from "@material-ui/icons/Publish";

interface Props extends OutlinedTextFieldProps {
  onUpload: (file: File) => void;
}

export const SensitiveUploadField: React.FC<Props> = ({ onUpload, ...props }) => {
  const [fileInputId] = useState(`file-input-${Math.floor(Math.random() * 1000000000)}`);
  const [isShowingPassword, setIsShowingPassword] = useState(false);

  const handleUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { target } = event;
      if (!target.files) {
        return;
      }
      const file = target.files[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload],
  );

  return (
    <TextField
      {...props}
      type={isShowingPassword ? props.type : "password"}
      InputProps={
        props.disabled
          ? {}
          : {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setIsShowingPassword(!isShowingPassword)}>
                    {isShowingPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                  <label htmlFor={fileInputId}>
                    <IconButton component="span">
                      <PublishIcon />
                    </IconButton>
                  </label>
                  <input
                    id={fileInputId}
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleUpload}
                  />
                </InputAdornment>
              ),
            }
      }
    />
  );
};
