// import React from 'react'
import { createRoot } from "react-dom/client";
// import * as Sentry from "@sentry/react";
// import { BrowserTracing } from "@sentry/tracing";
import App from "./app/page/App";
import "./index.scss";

// Sentry.init({
//     dsn: "https://d253ba2e54954b449d98bbaeb1ee5687@o4504554815291392.ingest.sentry.io/4504554821255168",
//     integrations: [new BrowserTracing()],

//     // Set tracesSampleRate to 1.0 to capture 100%
//     // of transactions for performance monitoring.
//     // We recommend adjusting this value in production
//     tracesSampleRate: 1.0,
// });

const container = document.getElementById("root");
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<App />);
