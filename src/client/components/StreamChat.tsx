import React from "react"
import { Paper, TextField, makeStyles, IconButton, InputAdornment, Typography } from "@material-ui/core"
import SendIcon from '@material-ui/icons/Send';

export const StreamChat: React.FC = () => {
  const styles = useStyles();

  return (
    <Paper className={styles.root}>
      <div className={styles.chat}>
        <Typography variant="overline" color="textSecondary">Chat coming soon</Typography>
      </div>
      <div className={styles.form}>
        <TextField placeholder="Send a message" variant="outlined" size="small" fullWidth disabled InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" disabled>
                <SendIcon />
              </IconButton>
            </InputAdornment>
          )
        }} />
      </div>
    </Paper>
  )
}

const useStyles = makeStyles(theme => ({
  root: {
    flex: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    minHeight: 300,
  },
  chat: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(2),
  },
  form: {
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
  },
}))
