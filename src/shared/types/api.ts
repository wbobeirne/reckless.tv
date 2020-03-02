export interface User {
  id: string;
  username: string;
}

export interface SelfUser extends User {
  pubkey?: string;
  nodeType?: "lnd";
  grpcUrl?: string;
  createdAt?: string;
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

export enum LivestreamStatus {
  live,
  offline,
}

export interface LivestreamArgs {
  title: string;
  description: string;
}

export interface Livestream {
  id: string;
  status: LivestreamStatus;
  title: string;
  description: string;
  playbackId?: string;
  // user: User;
  createdAt: string;
}

export interface SelfLivestream extends Livestream {
  streamKey: string;
  playbackId: string;
}

export interface UserLivestream {
  user: User;
  livestream?: Livestream;
}

export interface SelfUserLivestream {
  user: SelfUser;
  livestream?: SelfLivestream;
}

export type LivestreamList = Array<{
  user: User;
  livestream: Livestream;
}>

export interface StreamToken {
  id: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}
