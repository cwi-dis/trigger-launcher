import { remote } from "electron";
import { readFileSync } from "fs";
import * as request from "request";
import * as sharp from "sharp";

export type Nullable<T> = T | null;

export function getApplicationRoot() {
  if (process.env.TERM) {
    return "./";
  }

  return remote.app.getAppPath();
}

export function getApplicationConfig() {
  const path = getApplicationRoot() + "/config.json";
  const contents = readFileSync(path);

  return JSON.parse(contents.toString());
}

type HTTPMethods = "GET" | "POST" | "PUT" | "DELETE";
type PromiseResolve = (data: string) => void;
type PromiseReject = (err: {status: number, statusText: string, body?: string}) => void;

export function makeRequest(method: HTTPMethods, url: string, data?: any, contentType?: string, timeout?: number): Promise<string> {
  return new Promise<string>((resolve: PromiseResolve, reject: PromiseReject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          body: xhr.response
        });
      }
    };

    xhr.onerror = () => {
      reject({
        status: xhr.status,
        statusText: xhr.statusText,
        body: xhr.response
      });
    };

    if (typeof data === "object" && !(data instanceof FormData)) {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(data));
    } else {
      if (contentType) {
        xhr.setRequestHeader("Content-Type", contentType);
      }

      xhr.send(data);
    }

    if (timeout) {
      setTimeout(() => {
        if (xhr.readyState !== 4) {
          console.log("Aborting request due to timeout");
          xhr.abort();
        }
      }, timeout);
    }
  });
}

const imageCache: {[index: string]: any} = {};

export function fetchImage(url: string): Promise<sharp.SharpInstance> {
  if (imageCache[url]) {
    return Promise.resolve(sharp(imageCache[url]).flatten().resize(72, 72));
  } else {
    const reqPromise: Promise<Buffer> = new Promise((resolve, reject) => {
      request(url, { encoding: null }, (err, res, body) => {
        console.log("fetching image for", url);

        if (err) {
          reject();
        } else {
          imageCache[url] = body;
          resolve(body);
        }
      });
    });

    return reqPromise.then((body) => {
      return sharp(body).flatten().resize(72, 72);
    });
  }
}
