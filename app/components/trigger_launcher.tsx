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

import * as React from "react";
import * as io from "socket.io-client";

import StreamDeck from "../streamdeck_proxy";
import { makeRequest, fetchImage, pluralize } from "../util";
import EventContainer from "./event_container";

export type ParamTypes = "duration" | "time" | "string" | "url" | "const" | "set" | "selection";

export interface EventParams {
  type: ParamTypes;
  name: string;
  parameter: string;
  value?: string;
  options?: Array<{label: string, value: string}>;
  required?: boolean;
}

export interface Event {
  trigger: boolean;
  modify: boolean;
  id: string;
  parameters: Array<EventParams>;
  name: string;
  state: "abstract" | "ready" | "active";
  longdesc?: string;
  previewUrl?: string;
  verb?: string;
  productionId: string;
}

interface TriggerLauncherProps {
  documentId: string;
  serverUrl: string;
  clearSession: () => void;
}

interface TriggerLauncherState {
  buttonAssignments: Array<Event | null>;
  overflowingEvents: number;
}

class TriggerLauncher extends React.Component<TriggerLauncherProps, TriggerLauncherState> {
  private readonly SLOT_COUNT = 15;

  private socket: SocketIOClient.Socket;
  private streamDeck: StreamDeck;
  private eventContainerRefs: Array<EventContainer | null> = new Array(this.SLOT_COUNT).fill(null);

  public constructor(props: any) {
    super(props);

    this.streamDeck = new StreamDeck();

    this.state = {
      buttonAssignments: new Array(this.SLOT_COUNT).fill(null),
      overflowingEvents: 0
    };
  }

  private subscribeToEventUpdates() {
    const { serverUrl } = this.props;

    makeRequest("GET", `${serverUrl}/api/v1/configuration`).then((data) => {
      const { websocketService }: { [index: string]: string } = JSON.parse(data);
      const { documentId } = this.props;

      const url = websocketService.replace(/\/$/, "") + "/trigger";
      console.log("Connecting to", url);

      this.socket = io(url, { transports: ["websocket"] });

      this.socket.on("connect", () => {
        console.log("Connected to websocket-service");

        this.socket.emit("JOIN", documentId, () => {
          console.log("Joined channel for document ID", documentId);
        });
      });

      this.socket.on("EVENTS", (data: { events: Array<Event> }) => {
        console.log("Received trigger event update");
        const { events } = data;

        this.parseButtonAssignments(events);
      });
    });
  }

  private fetchEvents() {
    const { serverUrl } = this.props;
    const url = `${serverUrl}/api/v1/document/${this.props.documentId}/events`;

    makeRequest("GET", url).then((data) => {
      const events: Array<Event> = JSON.parse(data);
      this.parseButtonAssignments(events);
    });
  }

  private parseButtonAssignments(events: Array<Event>) {
    const { buttonAssignments } = this.state;

    const activeEvents = events.filter((ev) => ev.state === "active");
    const enqueuedEvents = events.filter((ev) => ev.state === "ready").map((event) => {
      const activeResult = activeEvents.find((active) => {
        return active.productionId === event.productionId;
      });

      return activeResult || event;
    });

    for (let i = 0; i < buttonAssignments.length; i++) {
      const buttonAssignment = buttonAssignments[i];

      if (buttonAssignment != null) {
        const result = enqueuedEvents.findIndex((ev) => ev.productionId === buttonAssignment.productionId);
        buttonAssignments[i] = (result >= 0) ? enqueuedEvents.splice(result, 1)[0] : null;
      }
    }

    for (let i = 0; i < buttonAssignments.length; i++) {
      const buttonAssignment = buttonAssignments[i];

      if (buttonAssignment == null) {
        buttonAssignments[i] = enqueuedEvents.shift() || null;
      }
    }

    this.setState({
      overflowingEvents: enqueuedEvents.length,
      buttonAssignments
    });
  }

  public componentDidMount() {
    window.onbeforeunload = () => {
      console.log("window about to close...");
      this.streamDeck.clearAllKeys();
      localStorage.removeItem("documentId");
    };

    this.streamDeck.clearAllKeys();
    this.streamDeck.setBrightness(100);

    this.streamDeck.onKeyUp((index) => {
      console.log("StreamDeck button pressed:", index);

      if (this.eventContainerRefs[index]) {
        console.log("Launching event...");
        this.eventContainerRefs[index]!.launchEvent();
      }
    });

    this.streamDeck.onError((error) => {
      console.error("StreamDeck:", error);
    });

    this.fetchEvents();
    this.subscribeToEventUpdates();
  }

  public componentWillUnmount() {
    this.streamDeck.clearAllKeys();
    this.socket.close();
  }

  private initializeButton(event: Event | null, i: number) {
    if (event == null) {
      this.streamDeck.clearKey(i);
      return;
    }

    if (event.state === "active") {
      if (event.previewUrl) {
        fetchImage(event.previewUrl).then((img) => {
          img.resize(60, 60).extend({ top: 6, right: 6, bottom: 6, left: 6, background: "#1DCB00"}).flatten().raw().toBuffer().then((bufferWithFrame: Buffer) => {
            this.streamDeck.fillImage(i, bufferWithFrame);
          });

        }).catch((err) => {
          console.error("Could not fetch image:", err);
        });
      } else {
        this.streamDeck.fillColor(i, 255, 0, 0);
      }
    } else {
      if (event.previewUrl) {
        fetchImage(event.previewUrl).then((img) => {
          img.resize(60, 60).extend({ top: 6, right: 6, bottom: 6, left: 6, background: "#000000"}).flatten().raw().toBuffer().then((buffer: Buffer) => {
            this.streamDeck.fillImage(i, buffer);
          });
        }).catch((err) => {
          console.error("Could not fetch image:", err);
        });
      } else {
        this.streamDeck.fillColor(i, 255, 255, 255);
      }
    }
  }

  private renderOverflowWarning() {
    const { overflowingEvents } = this.state;

    if (overflowingEvents > 0) {
      return (
        <p className="overflowWarning">
          Warning: {overflowingEvents} more {pluralize("event", overflowingEvents)} in queue
        </p>
      );
    }

    return null;
  }

  public render() {
    const { documentId, clearSession, serverUrl } = this.props;
    const { buttonAssignments } = this.state;

    return (
      <div>
        <div className="grid">
          {buttonAssignments.map((event, i) => {
            this.initializeButton(event, i);

            if (event == null) {
              return <div key={i} />;
            }

            return (
              <EventContainer
                key={i}
                documentId={documentId}
                serverUrl={serverUrl}
                ref={(e) => this.eventContainerRefs[i] = e}
                event={event}
              />
            );
          })}
        </div>
        <div className="remoteControl">
          <button style={{margin: 8}} className="button is-danger" onClick={clearSession.bind(this)}>
            Clear Session
          </button>
          {this.renderOverflowWarning()}
        </div>
      </div>
    );
  }
}

export default TriggerLauncher;
