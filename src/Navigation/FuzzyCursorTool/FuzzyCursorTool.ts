import {
  StateNode,
  TLInterruptEvent,
  TLCancelEvent,
  TLShape,
  Box,
  atom,
  Atom,
} from "tldraw";
import { getNodes } from "../useNavigation";

export class FuzzyCursorTool extends StateNode {
  // [1]
  static override id = "fuzzy-cursor";

  nodes: TLShape[] = [];
  focusedNode: Atom<TLShape[] | []> = atom("fuzzy cursor brush", []);

  // [2]
  override onEnter = () => {
    this.editor.setCursor({ type: "none", rotation: 0 });
    this.nodes = getNodes(this.editor);
    this.focusedNode.set([this.nodes[1]]);
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
    this.nodes = [];
  }
}
