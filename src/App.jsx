import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./css/custom-scrollbar.css";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material";
import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";
import Home from "./pages/Home";
import Board from "./pages/Board";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Calendar from "./pages/Calendar";
import User from "./pages/User";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  const theme = createTheme({
    palette: { mode: "dark" },
  });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="boards" element={<Home />} />
            <Route path="boards/:boardId" element={<Board />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="user" element={<User />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
