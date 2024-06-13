import {
  StateNode,
  TLInterruptEvent,
  TLCancelEvent,
  atom,
  Atom,
  TLEventHandlers,
  TLShape,
  EASINGS,
  Vec,
} from "tldraw";
import { getNodes } from "../useNavigation";

export class FuzzyCursorTool extends StateNode {
  // [1]
  static override id = "fuzzy-cursor";

  nodes: TLShape[] = [];
  focusedNode: Atom<TLShape> = atom("fuzzy cursor brush", {} as TLShape);

  override onEnter = () => {
    this.nodes = getNodes(this.editor);
    this.focusedNode.set(this.nodes[0]);
    this.moveCameraIfNeeded();
  };
  override onExit = () => {
    this.editor.setCursor({ type: "default", rotation: 0 });
  };

  override onKeyDown: TLEventHandlers["onKeyDown"] = (info) => {
    const currentIndex = this.nodes.indexOf(this.focusedNode.get());
    switch (info.code) {
      case "ArrowRight": {
        let nextIndex = currentIndex + 1;
        if (nextIndex > this.nodes.length - 1) {
          nextIndex = 0;
        }
        this.focusedNode.set(this.nodes[nextIndex]);
        this.moveCameraIfNeeded();
        break;
      }
      case "ArrowLeft": {
        let prevIndex = currentIndex - 1;
        if (prevIndex == -1) {
          console.log("hell0");
          prevIndex = this.nodes.length - 1;
        }
        console.log({ currentIndex, prevIndex });
        this.focusedNode.set(this.nodes[prevIndex]);
        this.moveCameraIfNeeded();
        break;
      }
      case "Enter": {
        const bounds = this.editor.getShapePageBounds(this.focusedNode.get());
        if (!bounds) return;
        this.editor.zoomToBounds(bounds, {
          duration: 500,
          easing: EASINGS.easeInOutCubic,
          inset: 0,
        });
      }
    }
  };

  moveCameraIfNeeded() {
    const node = this.focusedNode.get();
    const nodeBounds = this.editor.getShapePageBounds(node);
    const viewportPageBounds = this.editor.getViewportPageBounds();
    if (!nodeBounds || !viewportPageBounds) return;
    if (viewportPageBounds.contains(nodeBounds)) return;
    // pan the minimum amount needed to put the shape in bounds
    console.log("need to move camera");
    let deltaX = 0;
    let deltaY = 0;
    const zoomLevel = this.editor.getZoomLevel();
    // most zoomed out camera is 0.1, most zoomed in is 8
    // the more zoomed out the camera is, the bigger I want the padding

    const PADDING = 200 / zoomLevel;

    if (nodeBounds.x < viewportPageBounds.x) {
      //left
      deltaX = (viewportPageBounds.x - nodeBounds.x + PADDING) * zoomLevel;
    } else if (
      nodeBounds.x + nodeBounds.w >
      viewportPageBounds.x + viewportPageBounds.w
    ) {
      //right
      console.log("hi");
      deltaX =
        (viewportPageBounds.x +
          viewportPageBounds.w -
          (nodeBounds.x + nodeBounds.width) -
          PADDING) *
        zoomLevel;
    }

    if (nodeBounds.y < viewportPageBounds.y) {
      //up
      deltaY = (viewportPageBounds.y - nodeBounds.y + PADDING) * zoomLevel;
    } else if (
      nodeBounds.y + nodeBounds.height >
      viewportPageBounds.y + viewportPageBounds.h
    ) {
      //down
      deltaY =
        (viewportPageBounds.y +
          viewportPageBounds.h -
          (nodeBounds.y + nodeBounds.height) -
          PADDING) *
        zoomLevel;
    }
    this.editor.pan(new Vec(deltaX, deltaY));
  }

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
