import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.scss";
import { BrowserRouter } from "react-router";
import { useUiStore } from "@src/store/ui";
import { getDb } from "@src/lib/db";

async function bootstrap() {
  const isTauri = Boolean(
    (window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__
  );
  if (isTauri) {
    try {
      // Open DB first so plugin applies migrations before any selects.
      const db = await getDb();
      await db.execute("SELECT 1");
      await useUiStore.getState().initApp();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("DB bootstrap failed", err);
    }
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

bootstrap();
