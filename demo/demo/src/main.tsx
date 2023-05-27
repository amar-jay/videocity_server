import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Loading from "./components/loading.tsx";
const App = React.lazy(() => import("./App.tsx"));
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Suspense fallback={<Loading/>}>
      <App/>
    </Suspense>
  </React.StrictMode>
);
