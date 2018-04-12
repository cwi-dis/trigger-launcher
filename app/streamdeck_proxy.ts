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
    this.streamDeck && this.streamDeck.clearKey(this.keyMap[index]);
  }

  public clearAllKeys() {
    this.streamDeck && this.streamDeck.clearAllKeys();
  }

  public fillColor(index: number, r: number, g: number, b: number) {
    this.streamDeck && this.streamDeck.fillColor(this.keyMap[index], r, g, b);
  }

  public fillImageFromFile(index: number, path: string) {
    this.streamDeck && this.streamDeck.fillImageFromFile(this.keyMap[index], path);
  }

  public fillImage(index: number, buffer: Buffer) {
    this.streamDeck && this.streamDeck.fillImage(this.keyMap[index], buffer);
  }

  public setBrightness(brightness: number) {
    this.streamDeck && this.streamDeck.setBrightness(brightness);
  }

  public onKeyUp(callback: (index: number) => void) {
    if (this.streamDeck) {
      this.streamDeck.on("up", (index) => {
        callback(this.keyMap[index]);
      });
    }
  }
}

export default StreamDeckProxy;
