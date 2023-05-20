import { useState, useRef } from "react";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Divider,
  Checkbox,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EventIcon from "@mui/icons-material/Event";
import DoneOutlineOutlinedIcon from "@mui/icons-material/DoneOutlineOutlined";
import Moment from "moment";
import { MomentES } from "../../hooks/momentLocaleEs.js";
import es from "moment/locale/es";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import taskApi from "../../api/taskApi";
import "../../css/custom-ckeditor.css";
import DOMPurify from "dompurify";
import "moment/locale/es";

let timer;
const timeout = 500;
const labelAddToCalendar = { inputProps: { "aria-label": "Add to calendar" } };
const labelDone = { inputProps: { "aria-label": "Mark as done" } };

const TaskModal = (props) => {
  const boardId = props.boardId;
  const [task, setTask] = useState(props.task);
  const [title, setTitle] = useState(props.task?.title);
  const [content, setContent] = useState(props.task?.content);
  const [date, setDate] = useState(props.task?.date);
  const [addedToCalendar, setAddedToCalendar] = useState(
    props.task?.addedToCalendar
  );
  const [taskDone, setTaskDone] = useState(props.task?.done);
  const [edit, setEdit] = useState(false);
  const editorWrapperRef = useRef();
  const handleClose = () => {
    props.onUpdate(task);
    props.onClose();
    setEdit(false);
  };

  const deleteTask = async () => {
    props.onDelete(task);
    props.onClose();
  };

  const updateTitle = async (e) => {
    clearTimeout(timer);
    const newTitle = e.target.value;
    timer = setTimeout(async () => {
      try {
        await taskApi.update(boardId, task.id, { title: newTitle });
      } catch (err) {
        alert(err);
      }
    }, timeout);

    task.title = newTitle;
    setTitle(newTitle);
    props.onUpdate(task);
  };
  const updateDate = async (newDate) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await taskApi.update(boardId, task.id, { date: newDate });
      } catch (err) {
        alert(err);
      }
    }, timeout);

    task.date = newDate;
    setDate(newDate);
    props.onUpdate(task);
  };

  const updateDone = async (e) => {
    clearTimeout(timer);
    const newValue = e.target.checked;
    task.done = newValue;
    setTaskDone(newValue);
    props.onUpdateTaskDone(task, newValue);
    props.onUpdate(task);
  };

  const updateAddToCalendar = async (e) => {
    clearTimeout(timer);
    const newValue = e.target.checked;
    timer = setTimeout(async () => {
      try {
        await taskApi.update(boardId, task.id, { addedToCalendar: newValue });
      } catch (err) {
        alert(err);
      }
    }, timeout);

    task.addedToCalendar = newValue;
    setAddedToCalendar(newValue);
    props.onUpdate(task);
  };

  const updateContent = async (event, editor) => {
    clearTimeout(timer);
    const data = editor.getData();
    if (!!task) {
      timer = setTimeout(async () => {
        try {
          await taskApi.update(boardId, task.id, {
            content: DOMPurify.sanitize(data, { ADD_ATTR: ["target"] }),
          });
        } catch (err) {
          alert(err);
        }
      }, timeout);

      task.content = data;
      setContent(data);
      props.onUpdate(task);
    }
  };

  return (
    <Dialog
      open={!!task}
      onClose={handleClose}
      maxWidth={"sm"}
      fullWidth={true}
      disableEnforceFocus
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography sx={{ fontSize: ".8em", color: "#a9a9a9", margin: 0 }}>
            Creado el: {!!task ? MomentES(task.createdAt) : ""}
          </Typography>
          <Box>
            <IconButton
              variant="outlined"
              title="Editar contenido de la tarea"
              onClick={() => {
                editorWrapperRef.current.focus();
                setEdit(!edit);
              }}
            >
              {!edit ? <EditOutlinedIcon /> : <DoneOutlineOutlinedIcon />}
            </IconButton>
            <IconButton
              variant="outlined"
              color="error"
              title="Borrar tarea"
              onClick={deleteTask}
            >
              <DeleteOutlinedIcon />
            </IconButton>
          </Box>
        </Box>
        {edit ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextField
              value={title}
              placeholder="Sin título"
              variant="outlined"
              sx={{
                flexGrow: 1,
                "& .MuiOutlinedInput-input": { padding: 0 },
                "& .MuiOutlinedInput-notchedOutline": { border: "unset" },
                "& .MuiOutlinedInput-root": {
                  fontSize: "2rem",
                  fontWeight: "700",
                },
              }}
              onChange={updateTitle}
            ></TextField>
          </Box>
        ) : (
          <>
            <Typography sx={{ fontSize: "2rem", fontWeight: "700", margin: 0 }}>
              {title !== "" ? title : "Untitled"}
            </Typography>
          </>
        )}

        <Divider sx={{ marginTop: "1.5rem" }} />
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            minHeight: content !== "" ? "18em" : "auto",
            display: "flex",
            flexDirection: "column",
            marginBottom: "1em",
          }}
          ref={editorWrapperRef}
        >
          {edit ? (
            <CKEditor
              editor={ClassicEditor}
              data={content}
              onChange={updateContent}
              config={{
                link: {
                  decorators: {
                    addTargetToExternalLinks: {
                      mode: "automatic",
                      callback: (url) => /^(https?:)?\/\//.test(url),
                      attributes: {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      },
                    },
                  },
                },
              }}
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DateTimePicker
              label="Fecha a publicar"
              value={Moment(date)}
              format="DD/MM/YYYY - HH:mm"
              onChange={(newDate) => updateDate(newDate)}
            />
          </LocalizationProvider>
        </Box>
        <Divider sx={{ marginY: "1em" }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Checkbox checked={taskDone} {...labelDone} onClick={updateDone} />
            {taskDone && (
              <Typography
                sx={{ fontSize: ".8em", color: "#a9a9a9", margin: 0 }}
              >
                Finalizado el {MomentES(task.finishedOnDate)}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            {addedToCalendar && (
              <Typography
                sx={{ fontSize: ".8em", color: "#a9a9a9", margin: 0 }}
              >
                {Moment(date) > Moment(task.createdAt)
                  ? "Agregado al calendario para el"
                  : "Fue agregado al calendario el"}{" "}
                {MomentES(date)}
              </Typography>
            )}
            <Checkbox
              checked={addedToCalendar}
              {...labelAddToCalendar}
              icon={<EventIcon sx={{ opacity: "0.2" }} />}
              checkedIcon={<EventIcon />}
              onClick={updateAddToCalendar}
            />
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
