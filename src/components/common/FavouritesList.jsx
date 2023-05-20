import { useState, useEffect } from "react";
import { ListItem, ListItemButton, Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import boardApi from "../../api/boardApi";
import { setFavouritesList } from "../../redux/features/favouritesSlice";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const FavouritesList = () => {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.favourites.value);
  const [activeIndex, setActiveIndex] = useState(0);
  const { boardId } = useParams();

  useEffect(() => {
    const getBoards = async () => {
      try {
        const res = await boardApi.getFavourites();
        dispatch(setFavouritesList(res));
      } catch (error) {
        alert(error);
      }
    };

    getBoards();
  }, []);

  useEffect(() => {
    const activeIndex = list.findIndex((e) => e.id === boardId);
    setActiveIndex(activeIndex);
  }, [list, boardId]);

  const onDragEnd = async ({ source, destination }) => {
    const newList = [...list];
    const [removed] = newList.splice(source.index, 1);
    newList.splice(destination.index, 0, removed);

    const activeItem = newList.findIndex((e) => e.id === boardId);
    setActiveIndex(activeItem);
    dispatch(setFavouritesList(newList));

    try {
      await boardApi.updateFavouritesPosition({ boards: newList });
    } catch (err) {
      alert(err);
    }
  };

  return (
    <>
      <ListItem sx={{ marginBottom: ".5em" }}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" fontWeight="700">
            Favoritos
          </Typography>
        </Box>
      </ListItem>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          key={"list-board-droppable-key"}
          droppableId="list-board-droppable"
        >
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {list.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <ListItemButton
                      ref={provided.innerRef}
                      {...provided.dragHandleProps}
                      {...provided.draggableProps}
                      selected={index === activeIndex}
                      component={Link}
                      to={`/boards/${item.id}`}
                      sx={{
                        pl: "20px",
                        cursor: snapshot.isDragging
                          ? "grab"
                          : "pointer !important",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.icon} {item.title}
                      </Typography>
                    </ListItemButton>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default FavouritesList;
