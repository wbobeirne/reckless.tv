import React, { useState } from "react";
import { Stepper, Step, StepLabel, makeStyles } from "@material-ui/core";
import { NodeForm } from "../components/NodeForm";
import { StreamForm } from "../components/StreamForm";
import { BroadcastInstructions } from "../components/BroadcastInstructions";
import { SelfLivestream } from "../../shared/types/api";

enum CreateStep {
  node,
  stream,
  broadcast,
}

export const CreateStream: React.FC = () => {
  const styles = useStyles();
  const [step, setStep] = useState(CreateStep.node);
  const [stream, setStream] = useState<SelfLivestream | null>(null);

  const steps = ["Connect your Node", "Configure your Channel", "Start Broadcasting"];

  let content;
  switch (step) {
    case CreateStep.node:
      content = <NodeForm onSave={() => setStep(CreateStep.stream)} />;
      break;
    case CreateStep.stream:
      content = (
        <StreamForm
          onSelectStream={stream => {
            setStream(stream);
            setStep(CreateStep.broadcast);
          }}
        />
      );
      break;
    case CreateStep.broadcast:
      content = (
        <BroadcastInstructions
          stream={stream}
          goToStreamSelect={() => {
            setStep(CreateStep.stream);
            setStream(null);
          }}
        />
      );
  }

  return (
    <>
      <Stepper className={styles.stepper} alternativeLabel activeStep={step}>
        {steps.map(s => (
          <Step key={s}>
            <StepLabel>{s}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {content}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  stepper: {
    background: "none",
    padding: 0,
    marginBottom: theme.spacing(6),
  },
}));
