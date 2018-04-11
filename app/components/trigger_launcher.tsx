import * as React from "react";
import * as escapeStringRegex from "escape-string-regexp";

import { makeRequest, getApplicationConfig } from "../util";
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
}

function splitNumberFromEventId(eventId: string) {
  const parts = eventId.split("-");
  return parts.slice(0, parts.length - 1).join("-");
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
    setInterval(() => {
      this.fetchEvents();
    }, this.pollingFrequency);

    this.fetchEvents();
  }

  public componentWillUnmount() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  public render() {
    const { documentId, clearSession } = this.props;
    const { activeEvents, enqueuedEvents } = this.state;

    console.log("Enqueued:", enqueuedEvents);
    console.log("Active:", activeEvents);

    const events = enqueuedEvents.slice(0, 15).map((event) => {
      const eventId = splitNumberFromEventId(event.id);
      const eventRegex = RegExp(`^${escapeStringRegex(eventId)}-[0-9]+$`);

      const result = activeEvents.find((active) => {
        return eventRegex.test(active.id);
      });

      return result || event;
    });

    console.log("Events without button:", enqueuedEvents.slice(15));

    return (
      <div>
        <div className="grid">
          {events.map((event, i) => {
            return (
              <EventContainer documentId={documentId}
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
