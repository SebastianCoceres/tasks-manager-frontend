import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import boardApi from "../api/boardApi";
import { Box, IconButton, TextField } from "@mui/material";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutline";
import EmojiPicker from "../components/common/EmojiPicker";
import { useDispatch, useSelector } from "react-redux";
import { setBoards } from "../redux/features/boardSlice";
import { setFavouritesList } from "../redux/features/favouritesSlice";
import Kanban from "../components/common/Kanban";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";

let timer;
const timeout = 500;

const Board = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [icon, setIcon] = useState("");

  const [openConfirmAction, setOpenConfirmAction] = useState(false);
  const [confirmAction, setConfirmAction] = useState(false);

  const boards = useSelector((state) => state.board.value);
  const favouriteList = useSelector((state) => state.favourites.value);

  useEffect(() => {
    const getBoard = async () => {
      try {
        const res = await boardApi.getOne(boardId);
        setTitle(res.title);
        setDescription(res.description);
        setSections(res.sections);
        setIsFavourite(res.favourite);
        setIcon(res.icon);
      } catch (err) {
        alert(err);
      }
    };
    getBoard();
  }, [boardId]);

  const onIconChange = async (newIcon) => {
    let temp = [...boards];
    const index = temp.findIndex((e) => e.id === boardId);
    temp[index] = { ...temp[index], icon: newIcon };

    if (isFavourite) {
      let tempFavourites = [...favouriteList];
      const favouriteIndex = tempFavourites.findIndex((e) => e.id === boardId);
      tempFavourites[favouriteIndex] = {
        ...tempFavourites[favouriteIndex],
        icon: newIcon,
      };
      dispatch(setFavouritesList(tempFavourites));
    }

    setIcon(newIcon);
    dispatch(setBoards(temp));

    try {
      await boardApi.update(boardId, { icon: newIcon });
    } catch (error) {
      alert(error);
    }
  };

  const updateTitle = async (e) => {
    clearTimeout(timer);
    const newTitle = e.target.value;

    let temp = [...boards];
    const index = temp.findIndex((e) => e.id === boardId);
    temp[index] = { ...temp[index], title: newTitle };
    setTitle(newTitle);
    dispatch(setBoards(temp));

    if (isFavourite) {
      let tempFavourites = [...favouriteList];
      const favouriteIndex = tempFavourites.findIndex((e) => e.id === boardId);
      tempFavourites[favouriteIndex] = {
        ...tempFavourites[favouriteIndex],
        title: newTitle,
      };
      dispatch(setFavouritesList(tempFavourites));
    }

    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { title: newTitle });
      } catch (error) {
        alert(err);
      }
    }, timeout);
  };

  const updateDescription = async (e) => {
    clearTimeout(timer);
    const newDescription = e.target.value;
    setDescription(newDescription);

    timer = setTimeout(async () => {
      try {
        await boardApi.update(boardId, { description: newDescription });
      } catch (error) {
        alert(err);
      }
    }, timeout);
  };

  const addToFavourites = async () => {
    try {
      const board = await boardApi.update(boardId, { favourite: !isFavourite });
      let newFavouriteList = [...favouriteList];
      if (isFavourite) {
        newFavouriteList = newFavouriteList.filter((el) => el.id !== boardId);
      } else {
        newFavouriteList.unshift(board);
      }
      dispatch(setFavouritesList(newFavouriteList));
      setIsFavourite(!isFavourite);
    } catch (error) {
      alert(error);
    }
  };

  const deleteBoard = async () => {
    try {
      await boardApi.delete(boardId);
      if (isFavourite) {
        const newFavouriteList = favouriteList.filter(
          (el) => el.id !== boardId
        );
        dispatch(setFavouritesList(newFavouriteList));
      }
      const newList = boards.filter((el) => el.id !== boardId);
      if (newList.length === 0) {
        navigate("/boards");
      } else {
        navigate(`/boards/${newList[0].id}`);
      }

      dispatch(setBoards(newList));
    } catch (error) {
      alert(error);
    }
  };

  const handleClose = () => {
    setOpenConfirmAction(false);
    setConfirmAction(false);
  };

  useEffect(() => {
    if (confirmAction) {
      deleteBoard();
    }
    handleClose();
  }, [confirmAction]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <IconButton
          variant="outlined"
          title="Guardar tablero en favoritos"
          onClick={addToFavourites}
        >
          {isFavourite ? (
            <StarOutlinedIcon color="warning" />
          ) : (
            <StarBorderOutlinedIcon />
          )}
        </IconButton>
        <IconButton
          variant="outlined"
          color="error"
          title="Borrar tablero"
          onClick={() => {
            setOpenConfirmAction(true);
          }}
        >
          <DeleteOutlinedIcon />
        </IconButton>
      </Box>

      <ConfirmDeleteModal
        title={`Borrando tablero con id: ${boardId}`}
        open={openConfirmAction}
        onConfirm={() => setConfirmAction(true)}
        onClose={handleClose}
      />

      <Box sx={{ padding: ".5em 1em" }}>
        <Box>
          <EmojiPicker icon={icon} onChange={onIconChange} />
          <TextField
            value={title}
            placeholder="Sin título"
            variant="outlined"
            fullWidth
            onChange={updateTitle}
            sx={{
              "& .MuiOutlinedInput-input": { padding: 0 },
              "& .MuiOutlinedInput-notchedOutline": { border: "unset" },
              "& .MuiOutlinedInput-root": {
                fontSize: "2rem",
                fontWeight: "700",
              },
            }}
          ></TextField>
          <TextField
            value={description}
            placeholder="Agregar descripción"
            multiline
            variant="outlined"
            fullWidth
            onChange={updateDescription}
            sx={{
              "& .MuiInputBase-input": { padding: 0 },
              "& .MuiInputBase-multiline": { padding: "1em 0" },
              "& .MuiOutlinedInput-notchedOutline": { border: "unset" },
              "& .MuiOutlinedInput-root": { fontSize: "1rem" },
            }}
          ></TextField>
        </Box>
        <Box>
          <Kanban data={sections} boardId={boardId} />
        </Box>
      </Box>
    </>
  );
};

export default Board;
