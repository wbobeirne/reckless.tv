import { stringify } from "query-string";
import * as T from "../../shared/types/api";
export * from "../../shared/types/api";

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

class API {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  // Public methods
  getSelf() {
    return this.request<T.SelfUser>("GET", "/auth/me");
  }

  logout() {
    return this.request<T.MessageResponse>("DELETE", "/auth/me");
  }

  signup(args: T.AuthArgs) {
    return this.request<T.SelfUser>("POST", "/auth/signup", args);
  }

  login(args: T.AuthArgs) {
    return this.request<T.SelfUser>("POST", "/auth/login", args);
  }

  saveNodeConfig(args: T.NodeArgs) {
    return this.request<T.NodeResponse>("POST", "/user/me/node", args);
  }

  createStream(args: T.LivestreamArgs) {
    return this.request<T.Livestream>("POST", "/livestream", args);
  }

  getSelfLivestreams() {
    return this.request<T.Livestream[]>("GET", "/user/me/livestreams");
  }

  // Internal fetch function
  protected request<R extends object>(method: ApiMethod, path: string, args?: object): Promise<R> {
    let body = null;
    let query = "";
    const headers = new Headers();
    headers.append("Accept", "application/json");

    if (method === "POST" || method === "PUT") {
      body = JSON.stringify(args);
      headers.append("Content-Type", "application/json");
    } else if (args !== undefined) {
      // TS Still thinks it might be undefined(?)
      query = `?${stringify(args as any)}`;
    }

    return fetch(this.url + path + query, {
      method,
      headers,
      body,
    })
      .then(async res => {
        if (!res.ok) {
          let errMsg;
          try {
            const errBody = await res.json();
            if (!errBody.error) throw new Error();
            errMsg = errBody.error;
          } catch (err) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }
          throw new Error(errMsg);
        }
        return res.json();
      })
      .then(res => res as R)
      .catch(err => {
        console.error(`API error calling ${method} ${path}`, err);
        throw err;
      });
  }
}

export const api = new API("/api");
