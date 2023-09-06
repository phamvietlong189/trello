/* eslint-disable react/prop-types */
import Column from "./Column";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

const ListColumns = ({ columns }) => {
  const arrayIds = columns?.map((column) => column?._id);
  return (
    <SortableContext items={arrayIds} strategy={horizontalListSortingStrategy}>
      {columns?.length &&
        columns?.map((column) => <Column key={column?._id} column={column} />)}
    </SortableContext>
  );
};

export default ListColumns;
