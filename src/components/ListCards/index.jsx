/* eslint-disable react/prop-types */
import { Box } from "@mui/material";
import CardItem from "./CardItem";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const ListCards = ({ cards }) => {
  const arrayIds = cards?.map((card) => card?._id);

  return (
    <SortableContext items={arrayIds} strategy={verticalListSortingStrategy}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          paddingX: 2,
          overflowX: "hidden",
          overflowY: "auto",
          maxHeight: (theme) =>
            `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)} - ${
              theme.trello.columnHeaderHeight
            } - ${theme.trello.columnFooterHeight})`,
        }}
      >
        {cards?.length > 0 &&
          cards?.map((card) => <CardItem key={card?._id} card={card} />)}
      </Box>
    </SortableContext>
  );
};

export default ListCards;
