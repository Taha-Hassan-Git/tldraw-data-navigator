import { Box, track, useEditor } from "tldraw";
import "tldraw/tldraw.css";
import { FuzzyCursorTool } from "./FuzzyCursorTool/FuzzyCursorTool";

export const FuzzyCursorBox = track(function FuzzyCursorBox() {
  const editor = useEditor();

  const getFuzzyCursorBrush = () => {
    // get the focused node
    if (editor.getPath() !== "fuzzy-cursor") return null;

    const fuzzyCursorTool = editor.getCurrentTool() as FuzzyCursorTool;
    const node = fuzzyCursorTool.focusedNode.get();
    const bounds = editor.getShapePageBounds(node);
    if (!bounds) return null;
    const zoomLevel = editor.getZoomLevel();
    const { x, y } = editor.pageToViewport({ x: bounds.x, y: bounds.y });
    // return box
    return new Box(x, y, bounds.w * zoomLevel, bounds.h * zoomLevel);
  };
  const fuzzyCursorBrush = getFuzzyCursorBrush();
  if (!fuzzyCursorBrush) return null;
  const PADDING = 16;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(${fuzzyCursorBrush.x - PADDING / 2}px, ${
          fuzzyCursorBrush.y - PADDING / 2
        }px)`,
        width: fuzzyCursorBrush.w + PADDING,
        height: fuzzyCursorBrush.h + PADDING,
        // border: "1px solid var(--color-text-0)",
        borderRadius: 8,
        boxShadow: "0px 0px 15px 10px hsla(210, 100%, 50%, 0.2)",
        zIndex: 999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "red",
        // transition: "transform 0.05s ease-in-out",
      }}
    >
      <p>.</p>
    </div>
  );
});
