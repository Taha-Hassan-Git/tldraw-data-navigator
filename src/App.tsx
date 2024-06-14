import { TLComponents, TLUiAssetUrlOverrides, Tldraw } from "tldraw";
import snapshot from "./snapshot.json";
import { CustomToolbar, overrides } from "./overrides";
import { FuzzyCursorBox } from "./Navigation/FuzzyCursorBox";
import { FuzzyCursorTool } from "./Navigation/FuzzyCursorTool/FuzzyCursorTool";

export const customTools = [FuzzyCursorTool];

export const customAssetUrls: TLUiAssetUrlOverrides = {
  icons: {
    "tool-fuzzyCursor": "/tool-fuzzyCursor.svg",
  },
};

export const customComponents: TLComponents = {
  InFrontOfTheCanvas: FuzzyCursorBox,
  Toolbar: CustomToolbar,
};

function App() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        persistenceKey="kbd-navigation"
        overrides={overrides}
        components={customComponents}
        assetUrls={customAssetUrls}
        tools={customTools}
        onMount={(editor) => {
          (window as any).editor = editor;
        }}
      />
    </div>
  );
}

export default App;
