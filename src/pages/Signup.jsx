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

const Signup = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [usernameErrText, setUsernameErrText] = useState("");
  const [passwordErrText, setPasswordErrText] = useState("");
  const [confirmPasswordErrText, setConfirmPasswordErrText] = useState("");
  const [verificationCodeErrText, setVerificationCodeErrText] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUsernameErrText("");
    setPasswordErrText("");
    setConfirmPasswordErrText("");
    setVerificationCodeErrText("");

    const data = new FormData(e.target);
    const username = data.get("username").trim();
    const password = data.get("password").trim();
    const confirmPassword = data.get("confirmPassword").trim();
    const verificationCode = data.get("verificationCode").trim();

    let err = false;
    if (username === "") {
      err = true;
      setUsernameErrText("Por favor, llena este campo");
    }
    if (password === "") {
      err = true;
      setPasswordErrText("Por favor, llena este campo");
    }
    if (confirmPassword === "") {
      err = true;
      setConfirmPasswordErrText("Por favor, llena este campo");
    }
    if (password !== confirmPassword) {
      err = true;
      setPasswordErrText("!");
      setConfirmPasswordErrText("Las contraseñas no coinciden");
    }
    if (verificationCode === "") {
      err = true;
      setVerificationCodeErrText("!");
    }

    if (err) return;

    setLoading(true);
    try {
      const res = await authApi.signup({
        username,
        password,
        confirmPassword,
        verificationCode,
      });
      setLoading(false);
      localStorage.setItem("token", res.token);
      navigate("/");
    } catch (err) {
      console.log(err)
      const errors = err.data.errors;
      errors?.forEach((e) => {
        if (e.param === "username") {
          setUsernameErrText(e.msg);
        }
        if (e.param === "password") {
          setPasswordErrText(e.msg);
        }
        if (e.param === "confirmPassword") {
          setConfirmPasswordErrText(e.msg);
        }
        if (e.param === "verificationCode") {
          setVerificationCodeErrText(e.msg);
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
          autoComplete="new-password"
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
        <TextField
          margin="normal"
          required
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar contraseña"
          type={showPassword ? "text" : "password"}
          disabled={loading}
          error={confirmPasswordErrText !== ""}
          helperText={confirmPasswordErrText}
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Ver contraseña"
                  onClick={() => setShowPassword((show) => !show)}
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
        <TextField
          margin="normal"
          required
          fullWidth
          id="verificationCode"
          name="verificationCode"
          label="Código de verificación"
          type="text"
          disabled={loading}
          error={verificationCodeErrText !== ""}
          helperText={verificationCodeErrText}
          autoComplete="new-password"
        />

        <LoadingButton
          sx={{ mt: 3, mb: 2 }}
          variant="outlined"
          fullWidth
          color="success"
          type="submit"
          loading={loading}
        >
          Registrarse
        </LoadingButton>
      </Box>
      <Button component={Link} to="/login" sx={{ textTransform: "none" }}>
        Ya tienes una cuenta? Inicia sesión
      </Button>
    </>
  );
};

export default Signup;
