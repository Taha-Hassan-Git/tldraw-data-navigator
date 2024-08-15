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
  VecLike,
} from "tldraw";
import { animationOptions, getNodes, navigationRules } from "../useNavigation";
import { default as dataNavigator } from "data-navigator";

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
    const structure = getNodes(this.editor);
    // what is happening here
    const rendering = dataNavigator.rendering({
      elementData: structure.nodes,
      suffixId: "tldraw",
      root: {
        id: "root",
        cssClass: "",
        width: "100%",
        height: "100%",
      },
    });
    // todo: only initialise once
    rendering.initialize();
    const input = dataNavigator.input({
      structure,
      navigationRules,
    });
    // calculate the node that is closest to the center of the viewport
    const viewportCenter = this.editor.getViewportPageBounds().center;
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
        const zoomLevel = this.editor.getZoomLevel();
        const PADDING = 64 / zoomLevel;
        const newBounds = new Box(
          bounds.x - PADDING,
          bounds.y - PADDING,
          bounds.w + PADDING * 2,
          bounds.h + PADDING * 2
        );
        return this.editor.zoomToBounds(newBounds, {
          animation: animationOptions,
          immediate: false,
          force: true,
        });
      }
    }
  };

  moveCameraIfNeeded() {
    const node = this.focusedNode.get();
    const nodeBounds = this.editor.getShapePageBounds(node);
    const viewportPageBounds = this.editor.getViewportPageBounds();
    const zoomLevel = this.editor.getZoomLevel();
    const PADDING = 64 / zoomLevel;

    function calculateDeltas(
      nodeBounds: Box,
      viewportPageBounds: Box,
      zoomLevel: number
    ) {
      let deltaX = 0;
      let deltaY = 0;

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
    // Does the shape fit in the viewport + padding? If not, zoom to fit
    if (
      nodeBounds.h + PADDING * 2 > viewportPageBounds.h ||
      nodeBounds.w + PADDING * 2 > viewportPageBounds.w
    ) {
      const newBounds = new Box(
        nodeBounds.x - PADDING,
        nodeBounds.y - PADDING,
        nodeBounds.w + PADDING * 2,
        nodeBounds.h + PADDING * 2
      );
      return this.editor.zoomToBounds(newBounds, {
        animation: animationOptions,
        immediate: false,
        force: true,
        reset: false,
      });
    }
    const deltas = calculateDeltas(nodeBounds, viewportPageBounds, zoomLevel);
    this.editor.stopCameraAnimation();
    this.pan(deltas, animationOptions);
  }

  override onInterrupt: TLInterruptEvent = () => {
    this.complete();
  };

  override onCancel: TLCancelEvent = () => {
    this.complete();
  };
  pan(offset: VecLike, options): this {
    const { isLocked, panSpeed } = this.editor.getCameraOptions();
    if (isLocked) return this;
    const { x: cx, y: cy, z: cz } = this.editor.getCamera();
    this.editor.setCamera(
      new Vec(
        cx + (offset.x * panSpeed) / cz,
        cy + (offset.y * panSpeed) / cz,
        cz
      ),
      {
        animation: options,
      }
    );
    return this;
  }

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
      new Vec(focusedNodeBounds.x, focusedNodeBounds.y),
      new Vec(focusedNodeBounds.x + focusedNodeBounds.w, focusedNodeBounds.y),
      new Vec(
        focusedNodeBounds.w + focusedNodeBounds.x,
        focusedNodeBounds.y + focusedNodeBounds.h
      ),
      new Vec(focusedNodeBounds.x, focusedNodeBounds.y + focusedNodeBounds.h),
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

    let direction: keyof NodePositions = "up";
    switch (intersectingSegment) {
      case 0:
        direction = "up";
        break;
      case 1:
        direction = "right";
        break;
      case 2:
        direction = "down";
        break;
      case 3:
        direction = "left";
        break;
    }
    const distance = nodeCenter.dist(focusedNodeBounds.center);
    nodePositions[direction].push({ id: node.id, distance });
  });
  nodePositions.up.sort((a, b) => a.distance - b.distance);
  nodePositions.down.sort((a, b) => a.distance - b.distance);
  nodePositions.left.sort((a, b) => a.distance - b.distance);
  nodePositions.right.sort((a, b) => a.distance - b.distance);
  console.log(nodePositions);
  return nodePositions;
}
