import { useState, useEffect } from "react";
import Moment from "moment";
import { MomentES } from "../../hooks/momentLocaleEs.js";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Button, Autocomplete, TextField } from "@mui/material";
import taskApi from "../../api/taskApi.js";
import { Box, Alert } from "@mui/material";

function ExportPDF({ allTasks }) {
  const [boards, setBoards] = useState([]);
  const [query, setQuery] = useState({
    board: null,
    startDate: null,
    endDate: null,
  });
  const [hasError, setHasError] = useState(false);
  const [generatePDFmsgError, setGeneratePDFmsgError] = useState("");

  function handleStartDate(e) {
    setQuery({ ...query, startDate: Moment(e) });
  }
  function handleEndDate(e) {
    setQuery({ ...query, endDate: Moment(e) });
  }
  function handleBoardSelected(newValue) {
    const newBoardIndex = boards.findIndex((board) => board.title === newValue);
    setQuery({
      ...query,
      board: { id: boards[newBoardIndex].id, title: newValue },
    });
  }
  async function handleDownload() {
    try {
      console.log(query);
      const res = await taskApi.getTasksBetweenDates({
        boardId: query.board.id,
        startDate: query.startDate,
        endDate: query.endDate,
      });
      const pdfGenerated = await taskApi.generatePDF({
        boardId: query.board.id,
        tasks: res,
        start: query.startDate,
        end: query.endDate,
      });

      const url = URL.createObjectURL(
        new Blob([pdfGenerated], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `prog-${query.board.title}-${MomentES(
        query.startDate
      )}-${MomentES(query.endDate)}.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const temp = allTasks.map((el) => {
      return {
        id: el.board.id,
        title: el.board.title,
      };
    });

    const boardsAutocompleFields = temp.filter((value, i, arr) => {
      return i === arr.findIndex((obj) => obj.id === value.id);
    });

    setBoards(boardsAutocompleFields);
  }, [allTasks]);

  useEffect(() => {
    if (query.startDate > query.endDate) {
      setHasError(true);
      setGeneratePDFmsgError(
        "Fecha de inicio no puede ser mayor que fecha de fin"
      );
    } else if (query.board === null) {
      setHasError(true);
      setGeneratePDFmsgError("Debe seleccionar un tablero");
    } else {
      setHasError(false);
      setGeneratePDFmsgError("");
    }
  }, [query]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: { xs: "50%", lg: "100%" },
      }}
    >
      <Autocomplete
        id="boards-selector"
        options={boards.map((board) => board.title)}
        sx={{ mb: "1em" }}
        renderInput={(params) => (
          <TextField {...params} label="Seleccionar Tablero" />
        )}
        onChange={(e, newValue) => handleBoardSelected(newValue)}
      />
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DatePicker
          label="Desde"
          value={query.startDate}
          format="DD/MM/YYYY"
          onChange={handleStartDate}
          sx={{ mb: "1em" }}
        />
        <DatePicker
          label="Hasta"
          value={query.endDate}
          format="DD/MM/YYYY"
          onChange={handleEndDate}
          sx={{ mb: "1em" }}
        />
      </LocalizationProvider>
      <Button
        sx={{ mb: "1em" }}
        variant="outlined"
        onClick={handleDownload}
        disabled={hasError || Object.values(query).includes(null)}
      >
        Descargar pdf
      </Button>
      {!!generatePDFmsgError && (
        <Alert color="error" severity="error">
          {generatePDFmsgError}
        </Alert>
      )}
    </Box>
  );
}

export default ExportPDF;
