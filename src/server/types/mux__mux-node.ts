// Partial typing of @mux/mux-node, only for the parts of the module we need
declare module "@mux/mux-node" {
  import { EventEmitter } from "events";

  interface Base extends EventEmitter {}

  type Policy = "public" | "signed";

  export interface PlaybackID {
    id: string;
    policy: Policy;
  }

  export interface LiveStream {
    id: string;
    created_at: string;
    status: "active" | "idle";
    stream_key: string;
    active_asset_id?: string;
    recent_asset_ids: string[];
    new_asset_settings: object;
    playback_ids: PlaybackID[];
    passthrough: string;
    reduced_latency: boolean;
    simulcast_targets: unknown[];
  }

  interface LiveStreams extends Base {
    create(args: {
      reconnect_window?: number;
      playback_policy?: Policy[];
      new_asset_settings?: object;
      passthrough?: string;
      reduced_latency?: boolean;
      simulcast_targets?: unknown[];
    }): Promise<LiveStream>;
    del(id: string): Promise<void>;
    get(id: string): Promise<LiveStream>;
    list(): Promise<LiveStream[]>;
    signalComplete(id: string): Promise<void>;
    resetStreamKey(id: string): Promise<void>;
    createPlaybackId(id: string, args: { policy: Policy }): Promise<void>;
    deletePlaybackId(id: string): Promise<void>;
    // createSimulcastTarget
    // getSimulcastTarget
    // deleteSimulcastTarget
  }

  interface Video {
    LiveStreams: LiveStreams;
  }

  class Mux {
    Video: Video;
  }

  export default Mux;
}
