import { useState, useEffect } from "react";
import taskApi from "../api/taskApi";
import PropTypes from "prop-types";
import Moment from "moment";
import { MomentES } from "../hooks/momentLocaleEs.js";
import {
  Box,
  Badge,
  Card,
  CardContent,
  IconButton,
  Typography,
  Divider,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import ExportPDF from "../components/common/ExportPDF";

const initialValue = Moment(Date.now());

function ServerDay(props) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
  const isSelected =
    !outsideCurrentMonth && highlightedDays.indexOf(day.date()) >= 0;
  return (
    <Badge
      key={day.toString()}
      overlap="circular"
      badgeContent={isSelected ? "🔵" : undefined}
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
      />
    </Badge>
  );
}

ServerDay.propTypes = {
  day: PropTypes.object.isRequired,
  highlightedDays: PropTypes.arrayOf(PropTypes.number),
  outsideCurrentMonth: PropTypes.bool.isRequired,
};

export default function DateCalendarTasks() {
  const [value, setValue] = useState(initialValue);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedDays, setHighlightedDays] = useState([]);
  const [tasksInThisDay, setTasksInThisDay] = useState([]);

  useEffect(() => {
    const getTasks = async () => {
      try {
        setIsLoading(true);
        const res = await taskApi.getTasksInCalendar();
        if (res) setTasks(res);
        const dates = res.map((el) => Moment(el.date));
        const daysToHightlight = dates
          .filter((date) => Moment(date).month() == value.month())
          .map((el) => el.date());
        setHighlightedDays(daysToHightlight);
        setIsLoading(false);
      } catch (err) {
        alert(err);
      }
    };
    getTasks();
  }, []);

  useEffect(() => {
    const tasksFilter = tasks.filter((el) => {
      return MomentES(el.date) === MomentES(value);
    });
    setTasksInThisDay(tasksFilter);
  }, [tasks]);

  const handleMonthChange = (currentDate) => {
    const dates = tasks.map((el) => Moment(el.date));
    const daysToHightlight = dates
      .filter((date) => Moment(date).month() == currentDate.month())
      .map((el) => el.date());
    setHighlightedDays(daysToHightlight);
  };

  const handleDayChange = (currentDate) => {
    setValue(currentDate);
    const tasksInThisDay = tasks.filter(
      (el) => MomentES(el.date) === MomentES(currentDate)
    );
    setTasksInThisDay(tasksInThisDay);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        flexDirection: { xs: "column", lg: "row" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: { xs: "row", lg: "column" },
          "@media(max-width: 1200px)": {
            width: "100%",
          },
          p: "1em",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DateCalendar
            value={value}
            onChange={handleDayChange}
            loading={isLoading}
            onMonthChange={handleMonthChange}
            renderLoading={() => <DayCalendarSkeleton />}
            slots={{
              day: ServerDay,
            }}
            slotProps={{
              day: {
                highlightedDays,
              },
            }}
          />
        </LocalizationProvider>
        {/* <ExportPDF allTasks={tasks} /> */}
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          "@media(max-width: 1440px)": {
            width: "100%",
          },
        }}
      >
        <Typography variant="h3" sx={{ mt: ".5em", fontSize: "2em" }}>
          {MomentES(value)}
        </Typography>
        <Divider sx={{ m: ".5em 0 1em 0" }} />
        <Box sx={{ display: "flex", flexWrap: "wrap", mx: "-1em" }}>
          {tasksInThisDay.map((task) => (
            <Box
              key={task._id}
              sx={{
                width: "100%",
                "@media(min-width: 1440px)": {
                  width: "50%",
                },
                paddingX: "1em",
                marginBottom: "1em",
                overflowX: "hidden",
              }}
            >
              <Card
                sx={{
                  border: "1px solid #ddd",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardContent
                  sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography noWrap={true} variant="h3" fontSize={"1.5em"}>
                      {task.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.8em",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        border: "1px solid #ddd",
                        padding: "0.2em",
                        borderRadius: "5px",
                      }}
                    >
                      <SaveOutlinedIcon sx={{ fontSize: "1em" }} />
                      {MomentES(task.createdAt)}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: task.content,
                      }}
                    ></Typography>
                  </Box>

                  <Divider sx={{ my: "1em" }} />

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Tooltip
                      title={
                        task.board.icon +
                        " " +
                        task.board.title +
                        " - " +
                        task.section.title
                      }
                    >
                      <IconButton
                        component={Link}
                        to={`/boards/${task.board.id}`}
                        aria-label="Ver detalle"
                      >
                        <RemoveRedEyeOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    {task.done ? (
                      <Tooltip
                        title={`Completado el ${MomentES(task.finishedOnDate)}`}
                      >
                        <Typography
                          title=""
                          sx={{
                            fontSize: "0.8em",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          Completado{" "}
                          <CheckCircleOutlineOutlinedIcon
                            sx={{ color: "#AAC8A7" }}
                          />
                        </Typography>
                      </Tooltip>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
