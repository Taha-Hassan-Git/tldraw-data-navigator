import { EASINGS, Editor } from "tldraw";

export function getNodes(editor: Editor) {
  const [yellow, blue] = editor.getCurrentPageShapes();

  const nodes = {
    yellow: {
      d: {
        rectangle: "a yellow rectangle",
      },
      dimensions: {
        x: yellow.x,
        y: yellow.y,
        width: yellow.props.width,
        height: yellow.props.height,
      },
      id: yellow.id,
      renderIf: "yellow",
      edges: ["yellow-blue"],
      semantics: { label: "a yellow rectangle" },
      shape: yellow,
    },
    blue: {
      d: {
        rectangle: "a blue rectangle",
      },
      dimensions: {
        x: blue.x,
        y: blue.y,
        width: blue.props.width,
        height: blue.props.height,
      },
      id: blue.id,
      renderIf: "blue",
      edges: ["blue-yellow"],
      semantics: { label: "a blue rectangle" },
      shape: blue,
    },
  };
  const edges = {
    "yellow-blue": {
      source: "yellow",
      target: "blue",
      navigationRules: ["sibling"],
    },
    "blue-yellow": {
      source: "blue",
      target: "yellow",
      navigationRules: ["sibling"],
    },
  };
  return { nodes, edges };
}

export const animationOptions = {
  duration: 500,
  easing: EASINGS.easeInOutCubic,
  inset: 0,
};

export const navigationRules = {
  sibling: {
    key: "arrowLeft",
    direction: "target",
  },
};
