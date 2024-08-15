import {
  DefaultToolbar,
  DefaultToolbarContent,
  TLShape,
  TLUiOverrides,
  TldrawUiMenuItem,
  Vec,
  useIsToolSelected,
  useTools,
} from "tldraw";
import { FuzzyCursorTool } from "./Navigation/FuzzyCursorTool/FuzzyCursorTool";
import { animationOptions } from "./Navigation/useNavigation";

export const overrides: TLUiOverrides = {
  actions: (editor, actions) => {
    const newActions = {
      ...actions,
      zoomIn: {
        id: "zoom-in",
        label: "action.zoom-in",
        kbd: "$=,=",
        readonlyOk: true,
        onSelect() {
          if (editor.isIn("fuzzy-cursor")) {
            // we want to keep the focused node in the viewport
            const fuzzyCursorTool = editor.getCurrentTool() as FuzzyCursorTool;
            const node = fuzzyCursorTool.focusedNode.get() as TLShape;
            const center = editor.getShapePageBounds(node)?.center;
            if (!center) return;
            const point = editor.pageToViewport(center);
            editor.zoomIn(new Vec(point.x, point.y), {
              animation: animationOptions,
              force: true,
              immediate: false,
              reset: false,
            });
            return;
          }
          editor.zoomIn(undefined, {
            animation: animationOptions,
            force: true,
            immediate: false,
            reset: false,
          });
        },
      },
      zoomOut: {
        id: "zoom-out",
        label: "action.zoom-out",
        kbd: "$-,=",
        readonlyOk: true,
        onSelect() {
          if (editor.isIn("fuzzy-cursor")) {
            // we want to keep the focused node in the viewport
            const fuzzyCursorTool = editor.getCurrentTool() as FuzzyCursorTool;
            const node = fuzzyCursorTool.focusedNode.get() as TLShape;
            const center = editor.getShapePageBounds(node)?.center;
            if (!center) return;
            const point = editor.pageToViewport(center);
            editor.zoomOut(new Vec(point.x, point.y), {
              animation: animationOptions,
              force: true,
              immediate: false,
              reset: false,
            });
            return;
          }
          editor.zoomOut(undefined, {
            animation: animationOptions,
            force: true,
            immediate: false,
            reset: false,
          });
        },
      },
    };
    return newActions;
  },
  tools: (editor, tools) => {
    return {
      ...tools,
      "fuzzy-cursor": {
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
        icon="tool-frame"
        isSelected={isFuzzyCursorSelected}
      />
      <DefaultToolbarContent />
    </DefaultToolbar>
  );
}
