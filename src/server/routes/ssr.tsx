import type { RouteManifestEntry } from "../manifest.js";
import type { NextFunction, Request, Response } from "express";

import path from "node:path";
import { Writable } from "node:stream";
import url from "node:url";
import { createComponent } from "solid-js";
import { generateHydrationScript, renderToStream } from "solid-js/web";

import { App } from "../../App.js";
import { getRouteMatcher } from "../manifest.js";

export const htmlStart = (manifest: ReadonlyArray<RouteManifestEntry>, styleTags: string) => `
<!DOCTYPE html>
<html>
  <head>
    <title>fncts-react-template</title>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="/assets/style.css" />
    ${generateHydrationScript()}
    <script type="module" src="/main.js" async></script>
    ${manifest
      .map((m) => `<link rel="modulepreload" href="${m.href}" />`)
      .reverse()
      .join("")}
    ${styleTags}
  </head>

  <body>
    <div id="app">`;

export const htmlEnd = `</div>
  </body>
</html>
`;

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

export async function ssr(req: Request, res: Response, next: NextFunction): Promise<void> {
  const match         = await getRouteMatcher(path.resolve(dirname, "../../../dist/route-manifest.json"));
  const routeManifest = match(req.url);
  if (!routeManifest) {
    next();
    return;
  }

  const { pipe, pipeTo } = renderToStream(() => <App url={req.url} manifest={routeManifest} />);

  res.setHeader("content-type", "text/html");
  res.write(htmlStart(routeManifest, ""));
  pipe(res);
}
