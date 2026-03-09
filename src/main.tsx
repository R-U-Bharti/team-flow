import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider, ConfirmProvider } from "./components/ui";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./redux/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary errorMsg="Something went wrong.">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <ToastProvider>
              <ConfirmProvider>
                <App />
              </ConfirmProvider>
            </ToastProvider>
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
);
