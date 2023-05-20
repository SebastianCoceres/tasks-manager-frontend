import {
  Box,
  Button,
  Divider,
  IconButton,
  TextField,
  Typography,
  Card,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutline";
import sectionApi from "../../api/sectionApi";
import taskApi from "../../api/taskApi";
import TaskModal from "./TaskModal";

let timer;
const timeout = 500;

function Kanban(props) {
  const [data, setData] = useState([]);
  const [selectedTask, setSelectedTask] = useState(undefined);
  const [hideCompletedTasks, setHideCompletedTasks] = useState(false);
  const boardId = props.boardId;
  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  const createSections = async () => {
    try {
      const newSection = await sectionApi.create(boardId);
      setData([...data, newSection]);
    } catch (error) {
      alert(error);
    }
  };

  const deleteSection = async (sectionId) => {
    try {
      await sectionApi.delete(boardId, sectionId);
      const newData = data.filter((section) => section.id !== sectionId);
      setData(newData);
    } catch (error) {
      alert(error);
    }
  };

  const updateSectionTitle = async (e, sectionId) => {
    clearTimeout(timer);
    const newTitle = e.target.value;
    const newData = [...data];
    const index = newData.findIndex((e) => e.id === sectionId);
    newData[index].title = newTitle;
    setData(newData);
    timer = setTimeout(async () => {
      try {
        await sectionApi.update(boardId, sectionId, { title: newTitle });
      } catch (error) {
        alert(error);
      }
    }, timeout);
  };

  const onDragEnd = async ({ source, destination }) => {
    if (destination) {
      const sourceColIndex = data.findIndex((e) => e.id === source.droppableId);
      const destinationColIndex = data.findIndex(
        (e) => e.id === destination.droppableId
      );
      const sourceCol = data[sourceColIndex];
      const destinationCol = data[destinationColIndex];

      const sourceSectionId = sourceCol.id;
      const destinationSectionId = destinationCol.id;
      const sourceTasks = [...sourceCol.tasks];
      const destinationTasks = [...destinationCol.tasks];

      if (source.droppableId !== destination.droppableId) {
        const [removed] = sourceTasks.splice(source.index, 1);
        destinationTasks.splice(destination.index, 0, removed);
        data[sourceColIndex].tasks = sourceTasks;
        data[destinationColIndex].tasks = destinationTasks;
      } else {
        const [removed] = destinationTasks.splice(source.index, 1);
        destinationTasks.splice(destination.index, 0, removed);
        data[destinationColIndex].tasks = destinationTasks;
      }

      try {
        await taskApi.updatePosition(boardId, {
          resourceList: sourceTasks,
          destinationList: destinationTasks,
          resourceSectionId: sourceSectionId,
          destinationSectionId: destinationSectionId,
        });

        setData(data);
      } catch (error) {
        alert(error);
      }
    }
  };

  const createTask = async (sectionId) => {
    try {
      const task = await taskApi.create(boardId, {
        sectionId,
      });
      const newData = [...data];
      const index = newData.findIndex((el) => el.id == sectionId);
      newData[index].tasks.unshift(task);
      setData(newData);
    } catch (error) {
      alert(error);
    }
  };

  const onUpdateTask = (task) => {
    const newData = [...data];
    const sectionIndex = newData.findIndex((el) => el.id === task.section.id);
    const taskIndex = newData[sectionIndex].tasks.findIndex(
      (el) => el.id === task.id
    );
    newData[sectionIndex].tasks[taskIndex] = task;
    setData(newData);
  };

  const onDeleteTask = async (task) => {
    const newData = [...data];
    const sectionIndex = newData.findIndex((el) => el.id === task.section.id);
    const taskIndex = newData[sectionIndex].tasks.findIndex(
      (el) => el.id === task.id
    );
    newData[sectionIndex].tasks.splice(taskIndex, 1);
    setData(newData);

    try {
      await taskApi.delete(boardId, task.id);
    } catch (err) {
      alert(err);
    }
  };

  const onUpdateTaskDone = async (task, newValue) => {
    const newData = [...data];
    const sectionIndex = newData.findIndex((el) => el.id === task.section.id);
    const taskIndex = newData[sectionIndex].tasks.findIndex(
      (el) => el.id === task.id
    );
    newData[sectionIndex].tasks[taskIndex].done = newValue;
    newData[sectionIndex].tasks[taskIndex].finishedOnDate = !!newValue
      ? Date.now()
      : "";

    setData(newData);

    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await taskApi.update(boardId, task.id, { done: newValue });
      } catch (err) {
        alert(err);
      }
    }, timeout);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {" "}
        <Button onClick={createSections}>Agregar sección</Button>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "1em",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={hideCompletedTasks}
                onClick={() => setHideCompletedTasks((prev) => !prev)}
              />
            }
            labelPlacement="start"
            label="Esconder completados"
          />
          |
          <Typography variant="body2" fontWeight="700">
            {data.length} Secciones
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ marginTop: "1em" }} />
      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            width: "calc(100vw - 400px)",
            overflowX: "auto",
          }}
        >
          {data.map((section) => (
            <div key={section.id} style={{ width: "18rem" }}>
              <Droppable key={section.id} droppableId={section.id}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ width: "18rem", padding: "1em", marginRight: "1em" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1em",
                      }}
                    >
                      <TextField
                        value={section.title}
                        placeholder="Sin título"
                        variant="outlined"
                        onChange={(e) => updateSectionTitle(e, section.id)}
                        sx={{
                          flexGrow: 1,
                          "& .MuiOutlinedInput-input": { padding: 0 },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "unset",
                          },
                          "& .MuiOutlinedInput-root": { fontSize: "1rem" },
                        }}
                      />
                      <IconButton
                        variant="outlined"
                        size="small"
                        sx={{
                          color: "#e9e9e9",
                          "&:hover": { color: "#A6BB8D" },
                        }}
                        onClick={() => createTask(section.id)}
                      >
                        <AddOutlinedIcon />
                      </IconButton>
                      <IconButton
                        variant="outlined"
                        size="small"
                        onClick={() => deleteSection(section.id)}
                        sx={{
                          color: "#e9e9e9",
                          "&:hover": { color: "#e81b16" },
                        }}
                      >
                        <DeleteOutlinedIcon />
                      </IconButton>
                    </Box>

                    {section.tasks.map(
                      (task, index) =>
                        (!hideCompletedTasks || !task.done) && (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  padding: "1em",
                                  marginBottom: ".5em",
                                  cursor: snapshot.isDragging
                                    ? "grab"
                                    : "pointer !important",
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Checkbox
                                    checked={task.done}
                                    onClick={(e) =>
                                      onUpdateTaskDone(task, e.target.checked)
                                    }
                                  />
                                  <Typography
                                    sx={{
                                      flexGrow: 1,
                                      textDecoration: task.done
                                        ? "line-through"
                                        : null,
                                    }}
                                    onClick={() => setSelectedTask(task)}
                                  >
                                    {task.title === ""
                                      ? "Sin título"
                                      : task.title}
                                  </Typography>
                                  <IconButton
                                    variant="outlined"
                                    size="small"
                                    onClick={() => onDeleteTask(task)}
                                    sx={{
                                      color: "#e9e9e9",
                                      "&:hover": { color: "#e81b16" },
                                    }}
                                  >
                                    <DeleteOutlinedIcon />
                                  </IconButton>
                                </Box>
                              </Card>
                            )}
                          </Draggable>
                        )
                    )}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </div>
          ))}
        </Box>
      </DragDropContext>
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          boardId={boardId}
          onClose={() => setSelectedTask(undefined)}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
          onUpdateTaskDone={onUpdateTaskDone}
        />
      )}
    </>
  );
}

export default Kanban;
