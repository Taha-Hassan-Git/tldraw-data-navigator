import {
  StateNode,
  TLInterruptEvent,
  TLCancelEvent,
  atom,
  Atom,
  TLEventHandlers,
  TLShape,
  Vec,
  Box,
} from "tldraw";
import { animationOptions, getNodes } from "../useNavigation";

export class FuzzyCursorTool extends StateNode {
  // [1]
  static override id = "fuzzy-cursor";

  nodes: TLShape[] = [];
  focusedNode: Atom<TLShape> = atom("fuzzy cursor brush", {} as TLShape);

  override onEnter = () => {
    this.nodes = getNodes(this.editor);
    // calculate the node that is closest to the center of the viewport
    const viewportCenter = this.editor.getViewportPageCenter();
    const distances = this.nodes
      .map((node, i) => {
        const bounds = this.editor.getShapePageBounds(node)!;
        const point = bounds.center;
        return { index: i, distance: point.dist(viewportCenter) };
      })
      .sort((a, b) => a.distance - b.distance);

    this.focusedNode.set(this.nodes[distances[0].index]);
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
          prevIndex = this.nodes.length - 1;
        }
        this.focusedNode.set(this.nodes[prevIndex]);
        this.moveCameraIfNeeded();
        break;
      }
      case "Enter": {
        const bounds = this.editor.getShapePageBounds(this.focusedNode.get());
        if (!bounds) return;
        this.editor.zoomToBounds(bounds, animationOptions);
      }
    }
  };

  moveCameraIfNeeded() {
    const node = this.focusedNode.get();
    const nodeBounds = this.editor.getShapePageBounds(node);
    const viewportPageBounds = this.editor.getViewportPageBounds();
    const zoomLevel = this.editor.getZoomLevel();

    function calculateDeltas(
      nodeBounds: Box,
      viewportPageBounds: Box,
      zoomLevel: number
    ) {
      let deltaX = 0;
      let deltaY = 0;
      const PADDING = 64 / zoomLevel;

      if (nodeBounds.x < viewportPageBounds.x) {
        //left
        deltaX = (viewportPageBounds.x - nodeBounds.x + PADDING) * zoomLevel;
      } else if (
        nodeBounds.x + nodeBounds.w >
        viewportPageBounds.x + viewportPageBounds.w
      ) {
        //right
        deltaX =
          (viewportPageBounds.x +
            viewportPageBounds.w -
            (nodeBounds.x + nodeBounds.w) -
            PADDING) *
          zoomLevel;
      }

      if (nodeBounds.y < viewportPageBounds.y) {
        //up
        deltaY = (viewportPageBounds.y - nodeBounds.y + PADDING) * zoomLevel;
      } else if (
        nodeBounds.y + nodeBounds.h >
        viewportPageBounds.y + viewportPageBounds.h
      ) {
        //down
        deltaY =
          (viewportPageBounds.y +
            viewportPageBounds.h -
            (nodeBounds.y + nodeBounds.h) -
            PADDING) *
          zoomLevel;
      }
      return new Vec(deltaX, deltaY);
    }
    if (!nodeBounds || !viewportPageBounds) return;
    if (viewportPageBounds.contains(nodeBounds)) return;
    // Does the shape fit in the viewport + padding?
    if (
      nodeBounds.h > viewportPageBounds.h ||
      nodeBounds.w > viewportPageBounds.w
    ) {
      // calculate zoom needed to fit node into the viewport
      // scale viewport box accordingly
      // calculateDeltas() with new viewport
      // editor.setCamera with new zoom and bounds
      return this.editor.animateToShape(node.id, animationOptions);
    }
    const deltas = calculateDeltas(nodeBounds, viewportPageBounds, zoomLevel);
    this.editor.stopCameraAnimation();
    this.editor.pan(deltas, animationOptions);
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
