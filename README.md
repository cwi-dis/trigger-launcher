# Trigger-Launcher

This repository contains the sources for the *Trigger-Launcher* app, which
serves as an extension to the *Live-Triggering* pre-production tool and can
optionally be used with a *StreamDeck* device. Because it interacts with
hardware, it is a desktop application based on the Electron framework.

## Installation

In order to configure the application, make sure you have *Yarn* and *Webpack*
installed. Once you've done so, navigate to the project root and run

```
yarn install
```

This will install all project dependencies. Once complete, the application
sources need to be transpiled. To do that, run

```
webpack
```

If this step completes without errors, you're ready to actually launch the
application. In development mode, this is done as follows:

```
yarn start
```

## Configuration

Runtime configuration options for the application are read from the file
`config.json` located in the project root. When running the application on
your local machine, you should update the option `serverUrl` to point to a
running instance of the pre-production application, i.e. the pre-production
application (or trigger-tool) you want to interact with.

Note that starting from version 1.2.0, the `serverUrl` can also be changed
dynamically in the starting screen of the application.

## License and Authors

All code and documentation is licensed by the original author and contributors
under the Apache License v2.0:

* [Centrum Wiskunde & Informatica](https://www.cwi.nl) (original author)

See AUTHORS file for a full list of individuals and organisations that have
contributed to this code.

## Contributing

If you wish to contribute to this project, please get in touch with the authors.

## Acknowledgements

<img src="https://2immerse.eu/wp-content/uploads/2016/04/2-IMM_150x50.png" align="left"/><em>This project was originally developed as part of the <a href="https://2immerse.eu/">2-IMMERSE</a> project, co-funded by the European Commission’s <a hef="http://ec.europa.eu/programmes/horizon2020/">Horizon 2020</a> Research Programme</em>
