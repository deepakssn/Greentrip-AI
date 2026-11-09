import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App";
import { ThemeProvider } from "./theme";

export function render(url: string) {
  return renderToString(
    <ThemeProvider>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </ThemeProvider>,
  );
}
