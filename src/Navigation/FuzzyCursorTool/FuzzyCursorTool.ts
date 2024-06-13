import { StateNode, TLInterruptEvent, TLCancelEvent } from "tldraw";

export class FuzzyCursorTool extends StateNode {
  // [1]
  static override id = "fuzzy-cursor";
  static override initial = "idle";
  static override children = () => [];

  // [2]
  override onEnter = () => {
    this.editor.setCursor({ type: "none", rotation: 0 });
  };

  override onExit = () => {
    this.editor.setCursor({ type: "default", rotation: 0 });
  };

  // [3]
  override onInterrupt: TLInterruptEvent = () => {
    this.complete();
  };

  override onCancel: TLCancelEvent = () => {
    this.complete();
  };

  private complete() {
    this.parent.transition("select", {});
  }
}
