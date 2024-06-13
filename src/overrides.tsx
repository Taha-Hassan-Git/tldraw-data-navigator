import {
  DefaultToolbar,
  DefaultToolbarContent,
  TLUiOverrides,
  TldrawUiMenuItem,
  computed,
  useIsToolSelected,
  useTools,
} from "tldraw";
import { getNodes, $currentNode, moveToNode } from "./Navigation/useNavigation";

export const overrides: TLUiOverrides = {
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
