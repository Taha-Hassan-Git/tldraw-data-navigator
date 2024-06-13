import { TLUiOverrides, computed } from "tldraw";
import { getNodes, $currentNode, moveToNode } from "./Navigation/useNavigation";

export const overrides: TLUiOverrides = {
  actions(editor, actions) {
    console.log("actions", actions);
    const $nodes = computed("nodes", () => getNodes(editor));
    actions.copy = {
      id: "copy",
      label: "Copy",
      kbd: "",
      onSelect: () => undefined,
    };
    return {
      ...actions,
      "above-node": {
        id: "above-node",
        label: "Above node",
        kbd: "up",
        onSelect() {
          // const nodes = $nodes.get();
          // const currentNode = $currentNode.get();
          // const aboveNode = someFunction()
          // if (aboveNode){
          //   editor.stopCameraAnimation();
          //   moveToNode(editor, aboveNode);
          // }
        },
      },
      "below-node": {
        id: "below-node",
        label: "Below node",
        kbd: "up",
        onSelect() {
          // const nodes = $nodes.get();
          // const currentNode = $currentNode.get();
          // const belowNode = someFunction()
          // if (aboveNode){
          //   editor.stopCameraAnimation();
          //   moveToNode(editor, belowNode);
          // }
        },
      },
      "next-node": {
        id: "next-node",
        label: "Next node",
        kbd: "right",
        onSelect() {
          const nodes = $nodes.get();
          const currentNode = $currentNode.get();
          const index = nodes.findIndex((s) => s.id === currentNode?.id);
          const nextNode = nodes[index + 1] ?? currentNode ?? nodes[0];
          if (nextNode) {
            editor.stopCameraAnimation();
            moveToNode(editor, nextNode);
          }
        },
      },
      "previous-node": {
        id: "previous-node",
        label: "Previous node",
        kbd: "left",
        onSelect() {
          const nodes = $nodes.get();
          const currentNode = $currentNode.get();
          const index = nodes.findIndex((s) => s.id === currentNode?.id);
          const previousNode =
            nodes[index - 1] ?? currentNode ?? nodes[nodes.length - 1];
          if (previousNode) {
            editor.stopCameraAnimation();
            moveToNode(editor, previousNode);
          }
        },
      },
      "enter-child-node": {
        id: "enter-child-node",
        label: "Enter child node",
        kbd: "enter",
        onSelect() {
          const currentNode = $currentNode.get();
          if (currentNode) {
            const childId = editor.getSortedChildIdsForParent(
              currentNode.id
            )[0];
            if (childId) {
              editor.stopCameraAnimation();
              moveToNode(editor, editor.getShape(childId) as any);
            }
          }
        },
      },
      "exit-to-parent-node": {
        id: "exit-to-parent-node",
        label: "Exit to parent node",
        kbd: "esc",
        onSelect() {
          const currentNode = $currentNode.get();
          if (currentNode) {
            const parentId = editor.getParentId(currentNode.id);
            if (parentId) {
              editor.stopCameraAnimation();
              moveToNode(editor, editor.getShape(parentId) as any);
            }
          }
        },
      },
    };
  },
};
