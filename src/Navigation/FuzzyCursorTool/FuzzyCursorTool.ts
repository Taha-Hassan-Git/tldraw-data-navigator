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
  Editor,
  intersectLineSegmentLineSegment,
  TLShapeId,
} from "tldraw";
import { animationOptions, getNodes } from "../useNavigation";

type NodePosition = {
  id: string;
  distance: number;
};
type NodePositions = {
  up: NodePosition[];
  down: NodePosition[];
  left: NodePosition[];
  right: NodePosition[];
};

export class FuzzyCursorTool extends StateNode {
  // [1]
  static override id = "fuzzy-cursor";

  nodes: TLShape[] = [];
  focusedNode: Atom<TLShape> = atom("fuzzy cursor brush", {} as TLShape);
  nodePositionsCached = this.editor.store.createComputedCache<
    NodePositions,
    TLShape
  >("node positions infoCache", (shape) =>
    generateNodePositions(shape, this.editor)
  );

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
    // set the focused node to the closest node
    this.focusedNode.set(this.nodes[distances[0].index]);
    this.nodePositionsCached.get(this.focusedNode.get().id);
    this.moveCameraIfNeeded();
  };
  override onExit = () => {
    this.editor.setCursor({ type: "default", rotation: 0 });
  };

  override onKeyDown: TLEventHandlers["onKeyDown"] = (info) => {
    switch (info.code) {
      case "ArrowRight": {
        const closestNode = this.nodePositionsCached.get(
          this.focusedNode.get().id
        )?.right[0];
        if (!closestNode) return;
        const shape = this.editor.getShape(closestNode.id as TLShapeId)!;
        this.focusedNode.set(shape);
        this.moveCameraIfNeeded();
        break;
      }
      case "ArrowLeft": {
        const closestNode = this.nodePositionsCached.get(
          this.focusedNode.get().id
        )?.left[0];
        if (!closestNode) return;
        const shape = this.editor.getShape(closestNode.id as TLShapeId)!;
        this.focusedNode.set(shape);
        this.moveCameraIfNeeded();
        break;
      }
      case "ArrowUp": {
        const closestNode = this.nodePositionsCached.get(
          this.focusedNode.get().id
        )?.up[0];
        if (!closestNode) return;
        const shape = this.editor.getShape(closestNode.id as TLShapeId)!;
        this.focusedNode.set(shape);
        this.moveCameraIfNeeded();
        break;
      }
      case "ArrowDown": {
        const closestNode = this.nodePositionsCached.get(
          this.focusedNode.get().id
        )?.down[0];
        if (!closestNode) return;
        const shape = this.editor.getShape(closestNode.id as TLShapeId)!;
        this.focusedNode.set(shape);
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

function generateNodePositions(focusedNode: TLShape, editor: Editor) {
  const nodes = getNodes(editor).filter((node) => node.id !== focusedNode.id);
  const focusedNodeBounds = editor.getShapePageBounds(focusedNode);
  if (!focusedNodeBounds) return;
  const nodePositions: NodePositions = {
    up: [],
    down: [],
    left: [],
    right: [],
  };

  nodes.forEach((node) => {
    const bounds = editor.getShapePageBounds(node);

    if (!bounds) return;
    const nodeCenter = bounds.center;
    const corners = [
      new Vec(bounds.x, bounds.y),
      new Vec(bounds.x + bounds.w, bounds.y),
      new Vec(bounds.w + bounds.x, bounds.y + bounds.h),
      new Vec(bounds.x, bounds.y + bounds.h),
    ];

    const segments = [
      [corners[0], corners[1]],
      [corners[1], corners[2]],
      [corners[2], corners[3]],
      [corners[3], corners[0]],
    ];
    let intersectingSegment: number = 0;
    for (let i = 0; i < segments.length; i++) {
      const intersection = intersectLineSegmentLineSegment(
        segments[i][0],
        segments[i][1],
        focusedNodeBounds.center,
        nodeCenter
      );
      if (intersection) {
        intersectingSegment = i;
        break;
      }
    }

    const direction =
      intersectingSegment === 0
        ? "down"
        : intersectingSegment === 1
        ? "left"
        : intersectingSegment === 2
        ? "up"
        : "right";
    const distance = nodeCenter.dist(focusedNodeBounds.center);
    nodePositions[direction].push({ id: node.id, distance });
  });
  nodePositions.up.sort((a, b) => a.distance - b.distance);
  nodePositions.down.sort((a, b) => a.distance - b.distance);
  nodePositions.left.sort((a, b) => a.distance - b.distance);
  nodePositions.right.sort((a, b) => a.distance - b.distance);
  return nodePositions;
}
