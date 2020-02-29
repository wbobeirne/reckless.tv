import React, { useEffect } from "react"
import { Livestream } from "../../shared/types/api";

interface Props {
  stream: Livestream | null;
  goToStreamSelect(): void;
}

export const BroadcastInstructions: React.FC<Props> = ({ stream, goToStreamSelect }) => {
  useEffect(() => {
    if (!stream) {
      goToStreamSelect();
    }
  }, [stream, goToStreamSelect])

  if (!stream) {
    return null;
  }

  return <pre>{JSON.stringify(stream)}</pre>
};
