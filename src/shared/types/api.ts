import { } from "@radar/lnrpc"

export interface User {
  id: string;
  username: string;
}

export interface SelfUser extends User {
  pubkey?: string;
  nodeType?: "lnd";
  grpcUrl?: string;
}

export interface AuthArgs {
  username: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export interface NodeArgs {
  nodeType: "lnd";
  grpcUrl: string;
  macaroon: string;
  cert: string;
}

export interface NodeResponse {
  pubkey: string;
}

export interface LivestreamArgs {
  title: string;
  description: string;
}

export interface Livestream {
  id: string;
  title: string;
  description: string;
  user: User;
}
