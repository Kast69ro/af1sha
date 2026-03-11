import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import "./styles/index.css"; // твои глобальные стили (если нужны)
import { Provider } from "react-redux";
import { store } from "./lib/store";
import { createTheme, ThemeProvider } from "@mui/material";


const theme = createTheme({
  palette: {
    primary: {
      main: "#E31E24",
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
});
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <ThemeProvider theme={theme}>
    <BrowserRouter>
    <Provider store={store}>  
      <App />
    </Provider>
    </BrowserRouter>
    </ThemeProvider>
   </React.StrictMode>
);