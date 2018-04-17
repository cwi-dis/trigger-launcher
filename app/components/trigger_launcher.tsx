import * as React from "react";

import StreamDeck from "../streamdeck_proxy";
import { makeRequest, getApplicationConfig, fetchImage } from "../util";
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
  clearSession: () => void;
}

interface TriggerLauncherState {
  activeEvents: Array<Event>;
  enqueuedEvents: Array<Event>;
}

class TriggerLauncher extends React.Component<TriggerLauncherProps, TriggerLauncherState> {
  private streamDeck: StreamDeck;
  private eventContainerRefs: Array<EventContainer | null> = [
    null, null, null, null, null,
    null, null, null, null, null,
    null, null, null, null, null
  ];

  private pollingFrequency: number = 2000;
  private pollingInterval: any;

  public constructor(props: any) {
    super(props);

    this.state = {
      activeEvents: [],
      enqueuedEvents: []
    };
  }

  private fetchEvents() {
    const { serverUrl } = getApplicationConfig();
    const url = `${serverUrl}/api/v1/document/${this.props.documentId}/events`;

    console.log("updating events");

    makeRequest("GET", url).then((data) => {
      const events: Array<Event> = JSON.parse(data);

      this.setState({
        activeEvents: events.filter((ev) => ev.state === "active"),
        enqueuedEvents: events.filter((ev) => ev.state === "ready"),
      });
    }).catch((err) => {
      console.error("Could not fetch triggers:", err);
    });
  }

  public componentDidMount() {
    this.streamDeck = new StreamDeck();
    this.streamDeck.clearAllKeys();
    this.streamDeck.setBrightness(100);

    this.streamDeck.onKeyUp((index) => {
      console.log("StreamDeck button pressed:", index);

      if (this.eventContainerRefs[index]) {
        console.log("Launching event...");
        this.eventContainerRefs[index]!.launchEvent();
      }
    });

    setInterval(() => {
      this.fetchEvents();
    }, this.pollingFrequency);

    this.fetchEvents();
  }

  public componentWillUnmount() {
    this.streamDeck.clearAllKeys();

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  private initializeButton(event: Event, i: number) {
    if (event.state === "active") {
      if (event.previewUrl) {
        fetchImage(event.previewUrl).then((img) => {
          img.background("#1DCB00").resize(60, 60).extend(6).flatten().raw().toBuffer().then((bufferWithFrame) => {
            this.streamDeck.fillImage(i, bufferWithFrame);
          });

        }).catch(() => {
          console.log("Could not fetch image");
        });
      } else {
        this.streamDeck.fillColor(i, 255, 0, 0);
      }
    } else {
      if (event.previewUrl) {
        fetchImage(event.previewUrl).then((img) => {
          img.background("#000000").resize(60, 60).extend(6).flatten().raw().toBuffer().then((buffer) => {
            this.streamDeck.fillImage(i, buffer);
          });
        }).catch(() => {
          console.log("Could not fetch image");
        });
      } else {
        this.streamDeck.fillColor(i, 255, 255, 255);
      }
    }
  }

  public render() {
    const { documentId, clearSession } = this.props;
    const { activeEvents, enqueuedEvents } = this.state;

    const events = enqueuedEvents.slice(0, 15).map((event) => {
      const result = activeEvents.find((active) => {
        return active.productionId === event.productionId;
      });

      return result || event;
    });

    return (
      <div>
        <div className="grid">
          {events.map((event, i) => {
            this.initializeButton(event, i);

            return (
              <EventContainer documentId={documentId}
                              ref={(e) => this.eventContainerRefs[i] = e}
                              onTriggered={this.fetchEvents.bind(this)}
                              event={event} key={i} />
            );
          })}
        </div>
        <div className="remoteControl">
          <button style={{margin: 8}}
                  className="button is-danger"
                  onClick={clearSession.bind(this)}>
            Clear Session
          </button>
        </div>
      </div>
    );
  }
}

export default TriggerLauncher;
