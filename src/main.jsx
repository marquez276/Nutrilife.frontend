import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import { AppProvider } from "./app/context/AppContext.jsx";
import "./styles/index.css";
createRoot(document.getElementById("root")).render(
  <AppProvider>
    <App />
  </AppProvider>
);
