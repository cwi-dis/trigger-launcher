import * as React from "react";
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
  longdesc?: string;
  previewUrl?: string;
  verb?: string;
}

interface TriggerLauncherProps {
  documentId: string;
}

class TriggerLauncher extends React.Component<TriggerLauncherProps, {}> {
  public constructor(props: any) {
    super(props);
  }

  public render() {
    const { documentId } = this.props;

    return (
      <div>
        <div className="grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((n) => {
            const event: Event = {
              trigger: true,
              modify: false,
              id: `event-${n}`,
              parameters: [],
              name: `Event Number ${n}`,
              previewUrl: "https://origin.platform.2immerse.eu/dmapps/motogp/previews/crash.jpg",
              longdesc: "Lorem ipsum dolor sit amet"
            };

            return (
              <EventContainer documentId={documentId}
                              event={event} />
            );
          })}
        </div>
        <div className="remoteControl"></div>
      </div>
    );
  }
}

export default TriggerLauncher;
