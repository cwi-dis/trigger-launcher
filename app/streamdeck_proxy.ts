import StreamDeck = require("elgato-stream-deck");

class StreamDeckProxy {
  private streamDeck?: StreamDeck;
  private keyMap = [
    4,  3,  2,  1,  0,
    9,  8,  7,  6,  5,
    14, 13, 12, 11, 10
  ];

  public constructor() {
    try {
      this.streamDeck = new StreamDeck();
    } catch {
      console.error("no StreamDecks connected, proxying all calls");
      this.streamDeck = undefined;
    }
  }

  public clearKey(index: number) {
    try {
      this.streamDeck && this.streamDeck.clearKey(this.keyMap[index]);
    } catch {
      console.error("lost connection to StreamDeck");
      this.streamDeck = undefined;
    }
  }

  public clearAllKeys() {
    try {
      this.streamDeck && this.streamDeck.clearAllKeys();
    } catch {
      console.error("lost connection to StreamDeck");
      this.streamDeck = undefined;
    }
  }

  public fillColor(index: number, r: number, g: number, b: number) {
    try {
      this.streamDeck && this.streamDeck.fillColor(this.keyMap[index], r, g, b);
    } catch {
      console.error("lost connection to StreamDeck");
      this.streamDeck = undefined;
    }
  }

  public fillImageFromFile(index: number, path: string) {
    try {
      this.streamDeck && this.streamDeck.fillImageFromFile(this.keyMap[index], path);
    } catch {
      console.error("lost connection to StreamDeck");
      this.streamDeck = undefined;
    }
  }

  public fillImage(index: number, buffer: Buffer) {
    try {
      this.streamDeck && this.streamDeck.fillImage(this.keyMap[index], buffer);
    } catch {
      console.error("lost connection to StreamDeck");
      this.streamDeck = undefined;
    }
  }

  public setBrightness(brightness: number) {
    try {
      this.streamDeck && this.streamDeck.setBrightness(brightness);
    } catch {
      console.error("lost connection to StreamDeck");
      this.streamDeck = undefined;
    }
  }

  public onKeyUp(callback: (index: number) => void) {
    if (this.streamDeck) {
      this.streamDeck.on("up", (index) => {
        callback(this.keyMap[index]);
      });
    }
  }

  public onError(callback: (error: Error) => void) {
    if (this.streamDeck) {
      this.streamDeck.on("error", (error) => {
        callback(error);
      });
    }
  }
}

export default StreamDeckProxy;
