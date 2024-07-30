import { TLComponents, TLUiAssetUrlOverrides, Tldraw } from "tldraw";
import { CustomToolbar, overrides } from "./overrides";
import { FuzzyCursorBox } from "./Navigation/FuzzyCursorBox";
import { FuzzyCursorTool } from "./Navigation/FuzzyCursorTool/FuzzyCursorTool";

const customTools = [FuzzyCursorTool];

const customAssetUrls: TLUiAssetUrlOverrides = {
  icons: {
    "tool-fuzzyCursor": "/tool-fuzzyCursor.svg",
  },
};

const customComponents: TLComponents = {
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
          // eslint-disable-next-line
          (window as any).editor = editor;
        }}
      />
    </div>
  );
}

export default App;
