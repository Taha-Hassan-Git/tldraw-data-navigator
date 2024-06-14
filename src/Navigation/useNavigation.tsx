import { EASINGS, Editor, TLFrameShape } from "tldraw";

export function getNodes(editor: Editor) {
  const nodes = editor
    .getSortedChildIdsForParent(editor.getCurrentPageId())
    .map((id) => editor.getShape(id))
    .filter((s) => s?.type === "frame") as TLFrameShape[];
  return nodes || null;
}

export const animationOptions = {
  duration: 500,
  easing: EASINGS.easeInOutCubic,
  inset: 0,
};
