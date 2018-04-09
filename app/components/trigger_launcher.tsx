import * as React from "react";

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
    return (
      <div>Trigger Launcher for document ID {this.props.documentId}</div>
    );
  }
}

export default TriggerLauncher;
