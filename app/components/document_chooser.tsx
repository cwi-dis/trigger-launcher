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
import * as classNames from "classnames";

import { makeRequest, Nullable } from "../util";

interface DocumentChooserProps {
  assignDocumentId: (documentId: string) => void;
  assignServerUrl: (serverUrl: string) => void;
  serverUrl: string | null;
}

interface DocumentChooserState {
  existingDocuments: Array<{ id: string, description: string }>;
  endpointChanged: boolean;
}

class DocumentChooser extends React.Component<DocumentChooserProps, DocumentChooserState> {
  private idInput: Nullable<HTMLSelectElement>;
  private urlInput: Nullable<HTMLInputElement>;

  private docRequestInterval: any;

  constructor(props: DocumentChooserProps) {
    super(props);

    this.state = {
      existingDocuments: [],
      endpointChanged: false
    };
  }

  private requestDocuments() {
    const { serverUrl } = this.props;

    if (!this.state.endpointChanged) {
      makeRequest("GET", serverUrl + "/api/v1/document", undefined, undefined, 2000).then((data) => {
        const documents = JSON.parse(data);
        this.setState({
          existingDocuments: documents
        });
      }).catch((err) => {
        console.error("Could not fetch existing documents:", err);
        this.setState({ existingDocuments: [] });
      });
    }
  }

  public componentDidMount() {
    this.docRequestInterval = setInterval(this.requestDocuments.bind(this), 2000);
    this.requestDocuments();
  }

  public componentDidUpdate(prevProps: DocumentChooserProps) {
    const { serverUrl } = this.props;

    if (serverUrl !== prevProps.serverUrl) {
      if (this.docRequestInterval) {
        console.log("Cancelling old interval");
        clearInterval(this.docRequestInterval);
      }

      console.log("Restarting interval");
      this.docRequestInterval = setInterval(this.requestDocuments.bind(this), 2000);
      this.requestDocuments();
    }
  }

  public componentWillUnmount() {
    clearInterval(this.docRequestInterval);
  }

  private assignDocumentId() {
    if (this.idInput) {
      this.props.assignDocumentId(this.idInput.value);
    }
  }

  private assignServerUrl() {
    if (this.urlInput) {
      console.log("Assigning server URL", this.urlInput.value);
      this.props.assignServerUrl(this.urlInput.value);
      this.setState({ endpointChanged: false });
    }
  }

  public render() {
    const { existingDocuments, endpointChanged } = this.state;
    const { serverUrl } = this.props;

    return (
      <div style={{width: "50vw", margin: "15% auto"}}>
        <h3>Session Setup</h3>

        <div className="field has-addons">
          <div className="control is-expanded">
            <input
              className="input"
              type="url"
              placeholder="Endpoint"
              onChange={() => this.setState({ existingDocuments: [], endpointChanged: true })}
              ref={(e) => this.urlInput = e}
              defaultValue={serverUrl || ""}
            />
          </div>
          <div className="control">
            <button
              className="button is-info"
              disabled={!endpointChanged}
              onClick={this.assignServerUrl.bind(this)}
            >
              Update
            </button>
          </div>
        </div>

        <div className="select is-fullwidth is-info">
          <select key="id" ref={(e) => this.idInput = e} required={true}>
            {existingDocuments.sort().map((document, i) => {
              return <option key={i} value={document.id}>{document.description}</option>;
            })}
          </select>
        </div>

        <div className="field" style={{marginTop: 25}}>
          <div className="control">
            <button
              onClick={this.assignDocumentId.bind(this)}
              disabled={existingDocuments.length === 0 || endpointChanged}
              className={classNames("button", "is-info")}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default DocumentChooser;
