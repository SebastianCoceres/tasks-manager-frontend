import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { Link, useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameErrText, setUsernameErrText] = useState("");
  const [passwordErrText, setPasswordErrText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUsernameErrText("");
    setPasswordErrText("");
    const data = new FormData(e.target);
    const username = data.get("username").trim();
    const password = data.get("password").trim();

    let err = false;
    if (username === "") {
      err = true;
      setUsernameErrText("Por favor, llena este campo");
    }
    if (password === "") {
      err = true;
      setPasswordErrText("Por favor, llena este campo");
    }

    if (err) return;

    setLoading(true);
    try {
      const res = await authApi.login({
        username,
        password,
      });
      setLoading(false);
      localStorage.setItem("token", res.token);
      navigate("/");
    } catch (err) {
      const errors = err.data.errors;
      errors.forEach((e) => {
        if (e.param === "username") {
          setUsernameErrText(e.msg);
        }
        if (e.param === "password") {
          setPasswordErrText(e.msg);
        }
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Box component={"form"} sx={{ mt: 1 }} onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          name="username"
          label="Usuario"
          disabled={loading}
          error={usernameErrText !== ""}
          helperText={usernameErrText}
          autoComplete="username"
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="password"
          name="password"
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          disabled={loading}
          error={passwordErrText !== ""}
          helperText={passwordErrText}
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Ver contraseña"
                  onClick={() => setShowPassword((show) => !show)}
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {showPassword ? (
                    <VisibilityOffOutlinedIcon />
                  ) : (
                    <VisibilityOutlinedIcon />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <LoadingButton
          sx={{ mt: 3, mb: 2 }}
          variant="outlined"
          fullWidth
          color="success"
          type="submit"
          loading={loading}
        >
          Iniciar sesión
        </LoadingButton>
      </Box>
      <Button component={Link} to="/signup" sx={{ textTransform: "none" }}>
        No tienes una cuenta? Regístrate
      </Button>
    </>
  );
};

export default Login;
