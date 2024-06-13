import {
  Box,
  DefaultToolbar,
  DefaultToolbarContent,
  TLUiOverrides,
  TldrawUiMenuItem,
  useEditor,
  useIsToolSelected,
  useTools,
  useValue,
} from "tldraw";
import "tldraw/tldraw.css";

export const customUiOverrides: TLUiOverrides = {
  tools: (editor, tools) => {
    return {
      ...tools,
      fuzzyCursor: {
        id: "fuzzy-cursor",
        label: "Fuzzy cursor",
        icon: "tool-fuzzyCursor",
        kbd: "j",
        onSelect() {
          editor.setCurrentTool("fuzzy-cursor");
        },
      },
    };
  },
};

export function CustomToolbar() {
  const tools = useTools();
  const isFuzzyCursorSelected = useIsToolSelected(tools["fuzzy-cursor"]);
  return (
    <DefaultToolbar>
      <TldrawUiMenuItem
        {...tools["fuzzy-cursor"]}
        isSelected={isFuzzyCursorSelected}
      />
      <DefaultToolbarContent />
    </DefaultToolbar>
  );
}

export function FuzzyCursorBox() {
  const editor = useEditor();

  const fuzzyCursorBrush = useValue(
    "fuzzyCursor brush",
    () => {
      // get the focused node

      // calculate bounds

      // return box
      return new Box(0, 0, 0, 0);
    },
    [editor]
  );

  if (!fuzzyCursorBrush) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(${fuzzyCursorBrush.x}px, ${fuzzyCursorBrush.y}px)`,
        width: fuzzyCursorBrush.w,
        height: fuzzyCursorBrush.h,
        border: "1px solid var(--color-text-0)",
        zIndex: 999,
      }}
    />
  );
}
