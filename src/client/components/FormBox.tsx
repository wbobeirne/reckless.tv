import React from "react";
import { Box, Container, Paper, ContainerProps } from "@material-ui/core";

interface Props extends Omit<ContainerProps, 'onSubmit'> {
  onSubmit: React.HTMLProps<HTMLFormElement>['onSubmit'];
}

export const FormBox: React.FC<Props> = ({ onSubmit, children, ...props }) => {
  return (
    <Container maxWidth="xs" {...props}>
      <Paper>
        <Box p={4}>
          <form onSubmit={onSubmit}>
            {children}
          </form>
        </Box>
      </Paper>
    </Container>
  );
};
