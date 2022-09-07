import { Route,Router, Routes } from "@solidjs/router";
import * as Solid from "solid-js";

const Home = Solid.lazy(() => import("./pages/Home.js"));

interface AppProps {
  readonly url?: string;
  readonly manifest?: ReadonlyArray<{ href: string }>;
}

export function App({ url }: AppProps) {
  return (
    <Solid.Suspense fallback={<p>Loading...</p>}>
      <Router>
        <Routes base={url}>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </Solid.Suspense>
  );
}
