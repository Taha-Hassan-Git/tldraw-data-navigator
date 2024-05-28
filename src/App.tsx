import { TLFrameShape, Tldraw } from "tldraw";
import { default as dataNavigator } from "data-navigator";
import snapshot from "./snapshot.json";

function App() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        snapshot={snapshot}
        onMount={(editor) => {
          const frames = editor
            .getCurrentPageShapes()
            .filter((shape) => shape.type === "frame") as TLFrameShape[];
          const nodes = convertFramesToNodes(frames);
          const edges = generateEdges(nodes);
          const structure = {
            nodes,
            edges,
          };
          const rendering = dataNavigator.rendering({
            elementData: structure.nodes,
            defaults: {
              cssClass: (a, _b) => {
                if (!a.dimensions.path) {
                  console.log("no path");
                  return "dn-test-class";
                }
                console.log("path", a.dimensions.path);
                return "dn-test-path";
              },
            },
            suffixId: "data-navigator-schema",
            root: {
              id: "root",
              cssClass: "",
              width: "100%",
              height: 0,
            },
            entryButton: {
              include: true,
              callbacks: {
                click: () => {
                  enter();
                },
              },
            },
            exitElement: {
              include: true,
            },
          });
          rendering.initialize();
          let navigationRules = {
            right: {
              key: "ArrowRight",
              direction: "target",
            },
            left: {
              key: "ArrowLeft",
              direction: "source",
            },
            down: {
              key: "ArrowDown",
              direction: "target",
            },
            up: {
              key: "ArrowUp",
              direction: "source",
            },
            child: {
              key: "Enter",
              direction: "target",
            },
            parent: {
              key: "Backspace",
              direction: "source",
            },
            exit: {
              key: "Escape",
              direction: "target",
            },
            previous: {
              key: "Period",
              direction: "target",
            },
            undo: {
              key: "Period",
              direction: "target",
            },
            legend: {
              key: "KeyL",
              direction: "target",
            },
          };

          const input = dataNavigator.input({
            structure,
            navigationRules,
            entryPoint: "title",
            exitPoint: rendering.exitElement.id,
          });
          const initiateLifecycle = (nextNode: NodeObject) => {
            const node = rendering.render({
              renderId: nextNode.renderId,
              datum: nextNode,
            });
            node.addEventListener("keydown", (e) => {
              const direction = input.keydownValidator(e);
              if (direction) {
                e.preventDefault();
                move(direction);
              }
            });
            input.focus(nextNode.renderId);
            entered = true;
            previous = current;
            current = nextNode.id;
            rendering.remove(previous);
          };

          const enter = () => {
            const nextNode = input.enter();
            if (nextNode) {
              initiateLifecycle(nextNode);
            }
          };

          const move = (direction) => {
            const nextNode = input.move(current, direction);
            if (nextNode) {
              initiateLifecycle(nextNode);
            }
          };

          const exit = () => {
            entered = false;
            rendering.exitElement.style.display = "block";
            input.focus(rendering.exitElement.id);
            previous = current;
            current = null;
            rendering.remove(previous);
            hideTooltip();
          };
        }}
      />
    </div>
  );
}

function convertFramesToNodes(frames: TLFrameShape[]): NodeObject | undefined {
  const getEdges = (frame: TLFrameShape, frameIds: string[]) => {
    const edges = [];
    // is there a frame before you in the array? If so add an edge to it
    const index = frameIds.indexOf(frame.id);
    if (index > 0) {
      edges.push(`${frame.id}-${frameIds[index - 1]}`);
    }

    // is there a frame after you in the array? If so add an edge to it
    if (index < frameIds.length - 1) {
      edges.push(`${frame.id}-${frameIds[index + 1]}`);
    }
    return edges;
  };
  const nodes: NodeObject = {} as NodeObject;
  const frameIds = frames.map((frame) => frame.id);
  if (frameIds.length === 0) return undefined;
  frames.forEach((frame) => {
    const nodeId = frame.id;
    nodes[frame.id] = {
      d: {
        title: frame.props.name,
      },
      dimensions: {
        x: frame.x,
        y: frame.y,
        width: frame.props.w,
        height: frame.props.h,
      },
      id: nodeId,
      renderId: nodeId,
      edges: getEdges(frame, frameIds),
      semantics: {
        label: frame.props.name,
      },
    };
  });
  return nodes;
}
function generateEdges(nodes: NodeObject) {
  const edges: EdgeObject = {};
  Object.keys(nodes).forEach((nodeId) => {
    const node = nodes[nodeId];
    node.edges.forEach((edgeId) => {
      edges[edgeId] = {
        source: nodeId,
        target: edgeId.split("-")[1],
        navigationRules: ["left", "right"],
      };
    });
  });
  return edges;
}
export default App;
