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
