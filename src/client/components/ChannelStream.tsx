import React, { useMemo } from "react"
import { useChannelPaymentContext } from "../contexts/ChannelPayment";
import { StreamPlayer } from "../components/StreamPlayer";
import { StreamPaymentOverlay } from "../components/StreamPaymentOverlay";
import { Livestream, User, StreamToken } from "../../shared/types/api";

interface Props {
  livestream: Livestream;
  streamer: User;
}

export const ChannelStream: React.FC<Props> = ({ livestream, streamer }) => {
  const { token: contextToken } = useChannelPaymentContext();

  const token: StreamToken | undefined = useMemo(() => {
    if (livestream.playbackId) {
      return {
        id: `${Math.random()}`,
        token: livestream.playbackId,
        expiresAt: new Date(Date.now() + 50000000000).toISOString(),
        createdAt: new Date().toISOString(),
      }
    } else if (contextToken) {
      return contextToken;
    }
  }, [livestream.playbackId, contextToken])

  if (token) {
    return <StreamPlayer stream={livestream} token={token} controls muted playing />
  } else {
    return <StreamPaymentOverlay stream={livestream} streamer={streamer} />
  }
}
