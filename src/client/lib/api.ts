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
    return this.request<T.SelfLivestream>("POST", "/livestream", args);
  }

  editStream(id: string, args: T.LivestreamArgs) {
    return this.request<T.SelfLivestream>("PUT", `/livestream/${id}`, args);
  }

  getLivestreams() {
    return this.request<T.LivestreamList>("GET", "/livestream");
  }

  getSelfLivestreams() {
    return this.request<T.SelfLivestream[]>("GET", "/user/me/livestreams");
  }

  getUserLivestreams(username: string) {
    return this.request<T.LivestreamArgs[]>("GET", `/user/${username}/livestreams`);
  }

  getSelfLivestream() {
    return this.request<T.SelfUserLivestream>("GET", "/user/me/livestream");
  }

  getUserLivestream(username: string) {
    return this.request<T.UserLivestream>("GET", `/user/${username}/livestream`);
  }

  updateStreamStatus(id: string, status: T.LivestreamStatus) {
    return this.request<T.SelfLivestream>("PUT", `/livestream/${id}/status`, { status })
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
