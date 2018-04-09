import * as React from "react";
import * as classNames from "classnames";

import { getApplicationConfig, makeRequest, Nullable } from "../util";

interface DocumentChooserProps {
  assignDocumentId: (documentId: string) => void;
}

interface DocumentChooserState {
  existingDocuments: Array<string>;
}

class DocumentChooser extends React.Component<DocumentChooserProps, DocumentChooserState> {
  private idInput: Nullable<HTMLSelectElement>;
  private docRequestInterval: any;

  constructor(props: DocumentChooserProps) {
    super(props);

    this.state = {
      existingDocuments: []
    };
  }

  public componentDidMount() {
    const { serverUrl } = getApplicationConfig();

    const requestDocuments = () => {
      makeRequest("GET", serverUrl + "/api/v1/document").then((data) => {
        const documents = JSON.parse(data);
        this.setState({
          existingDocuments: documents
        });
      }).catch((err) => {
        console.error("Could not fetch existing documents:", err);
      });
    };

    this.docRequestInterval = setInterval(requestDocuments, 2000);
    requestDocuments();
  }

  public componentWillUnmount() {
    clearInterval(this.docRequestInterval);
  }

  private assignDocumentId() {
    if (this.idInput) {
      this.props.assignDocumentId(this.idInput.value);
    }
  }

  public render() {
    const { existingDocuments } = this.state;

    return (
      <div style={{width: "50vw", margin: "20% auto"}}>
          <h3>Document ID</h3>

          <div className="select is-fullwidth is-info">
            <select key="id" ref={(e) => this.idInput = e} required={true}>
              {existingDocuments.map((documentId, i) => {
                return <option key={i} value={documentId}>{documentId}</option>;
              })}
            </select>
          </div>

          <div className="field" style={{marginTop: 25}}>
            <div className="control">
              <button onClick={this.assignDocumentId.bind(this)}
                      disabled={existingDocuments.length === 0}
                      className={classNames("button", "is-info")}>
                Continue
              </button>
            </div>
          </div>
      </div>
    );
  }
}

export default DocumentChooser;
