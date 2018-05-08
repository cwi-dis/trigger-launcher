import * as React from "react";

import { getApplicationConfig } from "../util";
import DocumentChooser from "./document_chooser";
import TriggerLauncher from "./trigger_launcher";

interface AppState {
  documentId: string | null;
  serverUrl: string | null;
}

class App extends React.Component<{}, AppState> {
  public constructor(props: any) {
    super(props);

    this.state = {
      documentId: localStorage.getItem("documentId"),
      serverUrl: getApplicationConfig().serverUrl
    };
  }

  private assignDocumentId(documentId: string) {
    this.setState({ documentId });
    localStorage.setItem("documentId", documentId);
  }

  private assignServerUrl(serverUrl: string) {
    this.setState({ serverUrl });
  }

  private clearSession() {
    this.setState({ documentId: null });
    localStorage.removeItem("documentId");
  }

  private renderContent() {
    const { documentId, serverUrl } = this.state;

    if (documentId && serverUrl) {
      return <TriggerLauncher documentId={documentId}
                              serverUrl={serverUrl}
                              clearSession={this.clearSession.bind(this)} />;
    }

    return <DocumentChooser assignDocumentId={this.assignDocumentId.bind(this)}
                            assignServerUrl={this.assignServerUrl.bind(this)}
                            serverUrl={serverUrl} />;
  }

  public render() {
    return (
      <div>{this.renderContent()}</div>
    );
  }
}

export default App;
