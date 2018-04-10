import * as React from "react";

import DocumentChooser from "./document_chooser";
import TriggerLauncher from "./trigger_launcher";

interface AppState {
  documentId: string | null;
}

class App extends React.Component<{}, AppState> {
  public constructor(props: any) {
    super(props);

    this.state = {
      documentId: null
    };
  }

  private assignDocumentId(documentId: string) {
    this.setState({ documentId });
  }

  private clearSession() {
    this.setState({ documentId: null });
  }

  private renderContent() {
    const { documentId } = this.state;

    if (documentId) {
      return <TriggerLauncher documentId={documentId} clearSession={this.clearSession.bind(this)} />;
    }

    return <DocumentChooser assignDocumentId={this.assignDocumentId.bind(this)} />;
  }

  public render() {
    return (
      <div>{this.renderContent()}</div>
    );
  }
}

export default App;
