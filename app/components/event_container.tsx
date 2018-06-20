import * as React from "react";
import * as classNames from "classnames";

import { makeRequest } from "../util";
import { Event } from "./trigger_launcher";

interface EventContainerProps {
  documentId: string;
  serverUrl: string;
  event: Event;
  onTriggered?: () => void;
}

interface EventContainerState {
  isLoading: boolean;
  flashSuccess: boolean;
  flashError: boolean;
}

class EventContainer extends React.Component<EventContainerProps, EventContainerState> {
  constructor(props: EventContainerProps) {
    super(props);

    this.state = {
      isLoading: false,
      flashSuccess: false,
      flashError: false
    };
  }

  private getButtonLabel(): string {
    const { event } = this.props;

    if (event.verb) {
      return event.verb;
    } else if (event.state === "active") {
      return "modify";
    }

    return "show";
  }

  public launchEvent() {
    const { event, documentId } = this.props;

    const endpoint = (event.state === "active") ? "modify" : "trigger";
    const requestMethod = (event.state === "active") ? "PUT" : "POST";

    const { serverUrl } = this.props;
    const url = `${serverUrl}/api/v1/document/${documentId}/events/${event.id}/${endpoint}`;

    const data = JSON.stringify(event.parameters.map((param) => {
      return { parameter: param.parameter, value: param.value };
    }));

    console.log("Launching basic event at url", url, "with data", data);

    makeRequest(requestMethod, url, data, "application/json").then((data) => {
      console.log("success");

      if (event.state === "active") {
        setTimeout(() => {
          makeRequest("GET", `${serverUrl}/api/v1/document/${documentId}/events/requestbroadcast`).then(() => {
            console.log("broadcast requested");
          });
        }, 500);
      }

      this.setState({ flashSuccess: true});
      this.props.onTriggered && this.props.onTriggered();
    }).catch((err) => {
      console.log("error:", err);
      this.setState({ flashError: true});
    });
  }

  private dequeueEvent() {
    const { event, documentId, serverUrl } = this.props;

    const url = `${serverUrl}/api/v1/document/${documentId}/events/${event.id}/dequeue`;

    console.log("Dequeueing event", event.id);
    makeRequest("POST", url).then(() => {
      this.props.onTriggered && this.props.onTriggered();
    }).catch((err) => {
      console.error("Could not dequeue event", err);
    });
  }

  private renderParamCount(count: number) {
    if (count === 0) {
      return null;
    }

    return (
      <p style={{fontStyle: "italic"}}>{count} parameter{(count === 1) ? "" : "s"}</p>
    );
  }

  private renderParamValues() {
    const { event: { parameters } } = this.props;
    const configuredParams = parameters.filter((param) => param.type !== "set");

    if (configuredParams.length === 0) {
      return null;
    }

    return (
      <p>
        {configuredParams.map((param, i) => {
          return `${param.name}=${param.value || "null"}`;
        }).join(", ")}
      </p>
    );
  }

  private renderDequeueButton() {
    const { event: { state } } = this.props;

    if (state === "active") {
      return null;
    }

    return (
      <div onClick={this.dequeueEvent.bind(this)}
           className="dequeueButton">
        &times;
      </div>
    );
  }

  public render() {
    const { event } = this.props;
    const { isLoading, flashSuccess, flashError } = this.state;

    const paramCount = event.parameters.filter((param) => param.type !== "set").length;

    const borderColor = (event.state === "active") ? "#23D160" : "#161616";
    const bgColor = (event.state === "active") ? "#0C4620" : "transparent";

    const boxStyle: React.CSSProperties = {
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`
    };

    return (
      <div className="eventContainer" style={boxStyle}>
        {this.renderDequeueButton()}
        <div style={{display: "flex"}}>
          <div style={{width: 100, height: 100, margin: "0 15px 0 0", backgroundColor: "transparent"}}>
            {(event.previewUrl) && <img src={event.previewUrl} style={{maxWidth: 98, maxHeight: 98}} />}
          </div>
          <div>
            <h3 style={{fontSize: "1em", color: "#E9E9E9"}}>{event.name}</h3>
            {(event.longdesc) && <p>{event.longdesc}</p>}
            {this.renderParamCount(paramCount)}
            {this.renderParamValues()}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button className={classNames(
                              "button",
                              "is-info",
                              {"is-loading": isLoading, "button-pulse-success": flashSuccess, "button-pulse-error": flashError})}
                  onClick={this.launchEvent.bind(this)}
                  onAnimationEnd={() => this.setState({flashSuccess: false, flashError: false})}>
            {this.getButtonLabel()}
          </button>
        </div>
      </div>
    );
  }
}

export default EventContainer;
