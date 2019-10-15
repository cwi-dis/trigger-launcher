/**
 * Copyright 2018 Centrum Wiskunde & Informatica
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

export function pluralize(word: string, count: number): string {
  return (count === 0 || count > 1) ? word + "s" : word;
}

const imageCache: {[index: string]: any} = {};

export function fetchImage(url: string): Promise<sharp.Sharp> {
  if (imageCache[url]) {
    return Promise.resolve(sharp(imageCache[url]).flatten().resize(72, 72));
  } else {
    const reqPromise: Promise<Buffer> = new Promise((resolve, reject) => {
      request(url, { encoding: null }, (err, res, body) => {
        console.log("fetching image for", url);

        if (err) {
          console.error(err);
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
