import {
  Box,
  EASINGS,
  Editor,
  TLFrameShape,
  TLShape,
  atom,
  useEditor,
  useValue,
} from "tldraw";

export const $currentNode = atom<TLShape | null>("current node", null);
export const $currentLayer = atom<number>("current layer", 0);

export function moveToNode(editor: Editor, node: TLShape) {
  const shapePageBounds = editor.getShapePageBounds(node.id);
  // add padding
  if (!shapePageBounds) return;

  const PADDING = 232;
  const bounds = new Box(
    shapePageBounds.x - PADDING / 2,
    shapePageBounds.y - PADDING / 2,
    shapePageBounds.w + PADDING,
    shapePageBounds.h + PADDING
  );
  $currentNode.set(node);
  editor.selectNone();
  editor.zoomToBounds(bounds, {
    duration: 500,
    easing: EASINGS.easeInOutCubic,
    inset: 0,
  });
}

export function useNodes() {
  const editor = useEditor();
  return useValue<TLShape[]>("node shapes", () => getNodes(editor), [editor]);
}

export function useCurrentNode() {
  return useValue($currentNode);
}

export function useCurrentLayer() {
  return useValue($currentLayer);
}

export function getNodes(editor: Editor) {
  const nodes = editor
    .getSortedChildIdsForParent(editor.getCurrentPageId())
    .map((id) => editor.getShape(id))
    .filter((s) => s?.type === "frame") as TLFrameShape[];
  return nodes || null;
}
