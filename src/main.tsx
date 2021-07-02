import "./styles.css";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { App } from "./App";

const queryClient = new QueryClient();

const Root: React.FC<{}> = ({}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <React.Suspense fallback="Loading...">
        <App />
      </React.Suspense>
    </QueryClientProvider>
  );
};

ReactDOM.render(<Root />, document.querySelector("#app"));
