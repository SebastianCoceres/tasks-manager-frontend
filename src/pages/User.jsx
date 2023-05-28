import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Container,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { setUser } from "../redux/features/userSlice";
import { useSelector, useDispatch } from "react-redux";

const Login = () => {
  const user = useSelector((state) => state.user.value);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userIdErrText, setUserIdErrText] = useState("");
  const [usernameErrText, setUsernameErrText] = useState("");
  const [passwordErrText, setPasswordErrText] = useState("");

  const [newUserName, setNewUserName] = useState(user.username);
  const [newPassword, setNewPassword] = useState("");
  const [editUserName, setEditUserName] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUserIdErrText("");
    setUsernameErrText("");
    const data = new FormData(e.target);
    const username = data.get("username").trim();
    let err = false;
    if (username === "") {
      err = true;
      setUsernameErrText("Por favor, llena este campo");
    }
    if (err) return;

    setLoading(true);
    try {
      const newUserName = await authApi.editUserName({
        userId: user._id,
        username,
      });
      console.log({ user, newUserName });

      dispatch(setUser(newUserName));
      setLoading(false);
    } catch (err) {
      const errors = err.data.errors;
      errors.forEach((e) => {
        if (e.param === "userId") {
          Console.log("userId no valido");
        }
        if (e.param === "username") {
          setUsernameErrText(e.msg);
        }
      });
      setLoading(false);
    }
  };

  const handleCancelUsername = () => {
    setEditUserName(false);
    setUsernameErrText("");
  };

  useEffect(() => {
    userIdErrText ? console.log(userIdErrText) : null;
  }, [userIdErrText]);

  const InnerSubmitBtn = () => {
    return (
      <InputAdornment position="end">
        {editUserName ? (
          <>
            <IconButton type="submit">
              <CheckOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton type="reset" onClick={handleCancelUsername}>
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton onClick={() => setEditUserName(true)}>
              {!editUserName && (
                <EditOutlinedIcon aria-label="Editar nombre de usuario" />
              )}
            </IconButton>
          </>
        )}
      </InputAdornment>
    );
  };

  return (
    <>
      <Container maxWidth="sm" sx={{ mt: "1em" }}>
        <Box
          component={"form"}
          sx={{ display: "flex" }}
          onSubmit={handleUsernameSubmit}
          noValidate
        >
          <TextField
            margin="normal"
            fullWidth
            value={newUserName}
            id="username"
            name="username"
            label="Nombre de usuario"
            disabled={!editUserName}
            error={usernameErrText !== ""}
            helperText={usernameErrText}
            autoComplete="username"
            sx={{
              m: 0,
              "& #username.Mui-disabled": {
                color: "#fff",
                "-webkit-text-fill-color": "#fff",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: editUserName ? null : "unset",
              },
            }}
            InputProps={{ endAdornment: <InnerSubmitBtn /> }}
            onChange={(e) => setNewUserName(e.target.value)}
          />
        </Box>
        <Box
          component={"form"}
          sx={{ display: "flex" }}
          onSubmit={null}
          noValidate
        >
          <TextField
            margin="normal"
            fullWidth
            value={newPassword}
            id="password"
            type="password"
            name="password"
            label="Contraseña"
            disabled={!editPassword}
            error={passwordErrText !== ""}
            helperText={passwordErrText}
            autoComplete="username"
            sx={{
              m: 0,
              "& #username.Mui-disabled": {
                color: "#fff",
                "-webkit-text-fill-color": "#fff",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: editPassword ? null : "unset",
              },
            }}
            InputProps={{ endAdornment: <InnerSubmitBtn /> }}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Box>
      </Container>
    </>
  );
};

export default Login;
