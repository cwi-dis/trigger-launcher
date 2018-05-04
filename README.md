# Trigger-Launcher

This repository contains the sources for the *Trigger-Launcher* app, which serves as an extension to the
*Live-Triggering* pre-production tool and can optionally be used with a *StreamDeck* device. Because it interacts with hardware, it is a desktop application based on the Electron framework.

## Latest Builds

You can download the latest tagged build for either macOS or Windows from the origin server: http://origin.platform.2immerse.eu/trigger-launcher/

## Installation

In order to configure the application, make sure you have *Yarn* and *Webpack* installed. Once you've done so, navigate to the project root and run

```
yarn install
```

This will install all project dependencies. Once complete, the application sources need to be transpiled. To do that, run

```
webpack
```

If this step completes without errors, you're ready to actually launch the application. In development mode, this is done as follows:

```
yarn start
```

## Configuration

Runtime configuration options for the application are read from the file `config.json` located in the project root. When running the application on your local machine, you should update the option `serverUrl` to point to a running instance of the pre-production application, i.e. the pre-production application (or trigger-tool) you want to interact with (e.g. `https://editor.edge.2immerse.eu`).
