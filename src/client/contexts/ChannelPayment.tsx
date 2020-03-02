import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSnackbar } from "notistack";
import { requestProvider } from "webln";
import { closePrompt } from "react-webln-fallback-material-ui";
import { StreamToken, Livestream } from "../lib/api";
import { useAuthContext } from "./Auth";

interface ChannelPaymentState {
  readonly token: StreamToken | null;
  readonly paymentRequest: string | null;
  readonly canAllowancePay: boolean;
  requestPayment(amount: number, recurring?: boolean): void;
}

const ChannelPaymentContext = React.createContext<ChannelPaymentState | undefined>(undefined);

export const useChannelPaymentContext = () => {
  const val = React.useContext(ChannelPaymentContext);
  if (!val) {
    throw new Error("ChannelPaymentProvider isn't in the render tree for this component!");
  }
  return val;
};

interface Props {
  livestream: Livestream;
}

export const ChannelPaymentProvider: React.FC<Props> = ({ livestream, children }) => {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [token, setToken] = useState<StreamToken | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<string | null>(null);
  const [canAllowancePay] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  const wsSend = (obj: object) => {
    if (!ws.current) {
      console.warn("Requested payment before websocket was ready");
      return;
    }
    if (ws.current.readyState !== ws.current.OPEN) {
      console.warn("Attempted to send to unopened websocket", ws.current.readyState);
      return;
    }
    ws.current.send(JSON.stringify(obj))
  }

  // Error-resistent websocket opening, no need to memoize since it's stateless
  const recursiveWsOpen = (lsid: string) => {
    // const origin = location.origin.replace('https', 'wss').replace('http', 'ws');
    const origin = "ws://localhost:3000"
    ws.current = new WebSocket(`${origin}/api/livestream/${livestream.id}/payment`);

    ws.current.addEventListener("open", () => {
      wsSend({ type: "request-token" });
    })

    ws.current.addEventListener("message", ev => {
      let json: any;
      try {
        json = JSON.parse(ev.data.toString());
        if (!json) {
          throw new Error();
        }
      } catch (err) {
        console.warn("Got unexpected data from websocket", ev.data);
        return;
      }

      if (json.error) {
        return enqueueSnackbar(json.error, { variant: "error" });
      }

      if (json.type === "token") {
        setToken(json.data);
      }
      if (json.type === "payment") {
        setPaymentRequest(json.data);
      }
    });
    ws.current.addEventListener("error", () => {
      setTimeout(() => {
        recursiveWsOpen(lsid);
      }, 1000);
    });
  };

  const requestPayment = useCallback(
    (amount: number, recurring?: boolean) => {
      if (!ws.current) {
        console.warn("Requested payment before websocket was ready");
        return;
      }
      console.log(recurring);
      wsSend({ type: "request-payment", data: { amount } });
    },
    [ws],
  );

  // Open websocket ASAP
  useEffect(() => {
    if (user) {
      recursiveWsOpen(livestream.id);
    } else {
      setToken(null);
      setPaymentRequest(null);
    }

    () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [ws, user, livestream.id]);

  // Automatically attempt to send payments when we get one through
  useEffect(() => {
    if (!paymentRequest) {
      return;
    }

    requestProvider().then(webln => {
      webln.sendPayment(paymentRequest);
    });

    () => {
      closePrompt();
    };
  }, [paymentRequest]);

  const value = useMemo(
    () => ({
      token,
      paymentRequest,
      canAllowancePay,
      requestPayment,
    }),
    [token, paymentRequest, canAllowancePay, requestPayment],
  );

  return <ChannelPaymentContext.Provider value={value}>{children}</ChannelPaymentContext.Provider>;
};
