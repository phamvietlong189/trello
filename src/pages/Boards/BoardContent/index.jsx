/* eslint-disable react/prop-types */
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Box from "@mui/material/Box";
import { useCallback, useEffect, useRef, useState } from "react";
import ListColumns from "~/components/ListColumns";
import { mapOrder } from "~/utils/sorts";
import { cloneDeep } from "lodash";

import Column from "~/components/ListColumns/Column";
import CardItem from "~/components/ListCards/CardItem";

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

const BoardContent = ({ board }) => {
  // const pointerSensor = useSensor(PointerSensor, {
  //   activationConstraint: { distance: 10 },
  // });
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const lastOverId = useRef(null);

  const [orderedColumns, setOrderedColumns] = useState([]);
  // Ở một thời điểm chỉ có 1 phần tử được kéo, column hoặc card
  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
    useState(null);

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN)
        return closestCorners({ ...args });

      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections?.length > 0
          ? pointerIntersections
          : rectIntersection(args);

      let overId = getFirstCollision(intersections, "id");
      if (overId) {
        const checkColumn = orderedColumns.find(
          (column) => column?._id === overId
        );

        if (checkColumn) {
          overId = closestCenter({
            ...args,
            droppableContainers: args?.droppableContainers?.filter(
              (container) =>
                container?.id !== overId &&
                checkColumn?.cardOrderIds?.includes(container?.id)
            )[0]?.id,
          });
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeDragItemType, orderedColumns]
  );

  const findColumnByCardId = (cardId) => {
    return orderedColumns?.find((column) =>
      column?.cards?.map((card) => card?._id)?.includes(cardId)
    );
  };

  const handleMoveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumns((prevColumns) => {
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card?._id === overCardId
      );

      let newCardIndex;
      const isBelowOverItem =
        active?.rect?.current?.translated &&
        active?.rect?.current?.translated?.top >
          over?.rect?.top + over?.rect?.height;
      const modifier = isBelowOverItem ? 1 : 0;
      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards?.length + 1;

      const nextColumns = cloneDeep(prevColumns);
      const nextActiveColumns = nextColumns?.find(
        (column) => column?._id === activeColumn?._id
      );
      const nextOverColumns = nextColumns?.find(
        (column) => column?._id === overColumn?._id
      );

      if (nextActiveColumns) {
        // Xoá card ở column active (cũng có thể hiểu là column cũ, cái lúc kéo card ra khỏi nó để sang column khác)
        nextActiveColumns.cards = nextActiveColumns?.cards?.filter(
          (card) => card?._id !== activeDraggingCardId
        );

        // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumns.cardOrderIds = nextActiveColumns?.cards?.map(
          (card) => card?._id
        );
      }
      if (nextOverColumns) {
        // kiểm tra xem card đang kéo có tồn tại trong over column chưa, nếu có thì xoá nó trước
        nextOverColumns.cards = nextOverColumns?.cards?.filter(
          (card) => card?._id !== activeDraggingCardId
        );

        // phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card giữa 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumns?._id,
        };

        // thêm card đang kéo vào over column với vị trí index mới
        nextOverColumns.cards = nextOverColumns?.cards?.toSpliced(
          newCardIndex,
          0,
          rebuild_activeDraggingCardData
        );

        // cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumns.cardOrderIds = nextOverColumns?.cards?.map(
          (card) => card?._id
        );
      }

      return nextColumns;
    });
  };

  const handleDragStart = (e) => {
    setActiveDragItemId(e?.active?.id);
    setActiveDragItemType(
      e?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE?.CARD
        : ACTIVE_DRAG_ITEM_TYPE?.COLUMN
    );
    setActiveDragItemData(e?.active?.data?.current);

    if (e?.active?.data?.current?.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(e?.active?.id));
    }
  };

  const handleDragOver = (e) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE?.COLUMN) return;

    const { active, over } = e;

    if (!over || !active) return;

    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData },
    } = active;
    const { id: overCardId } = over;

    const activeColumn = findColumnByCardId(activeDraggingCardId);
    const overColumn = findColumnByCardId(overCardId);

    if (!activeColumn || !overColumn) return;

    if (activeColumn?._id !== overColumn?._id) {
      handleMoveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      );
    }
  };

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over || !active) return;

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE?.CARD) {
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData },
      } = active;
      const { id: overCardId } = over;

      const activeColumn = findColumnByCardId(activeDraggingCardId);
      const overColumn = findColumnByCardId(overCardId);

      if (!activeColumn || !overColumn) return;

      if (oldColumnWhenDraggingCard?._id !== overColumn?._id) {
        handleMoveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        );
      } else {
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(
          (card) => card?._id === activeDragItemId
        );
        const newCardIndex = overColumn?.cards?.findIndex(
          (card) => card?._id === overCardId
        );

        const newOrderedCards = arrayMove(
          oldColumnWhenDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        );

        setOrderedColumns((prevColumns) => {
          const nextColumns = cloneDeep(prevColumns);
          const targetColumn = nextColumns?.find(
            (column) => column?._id === overColumn?._id
          );
          targetColumn.cards = newOrderedCards;
          targetColumn.cardOrderIds = newOrderedCards?.map((card) => card?._id);

          return nextColumns;
        });
      }
    }

    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE?.COLUMN) {
      if (active?.id !== over?.id) {
        const oldColumnIndex = orderedColumns?.findIndex(
          (column) => column?._id === active?.id
        );
        const newColumnIndex = orderedColumns?.findIndex(
          (column) => column?._id === over?.id
        );
        const newOrderedColumns = arrayMove(
          orderedColumns,
          oldColumnIndex,
          newColumnIndex
        );
        setOrderedColumns(newOrderedColumns);
      }
    }

    // set active item = null
    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnWhenDraggingCard(null);
  };

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, "_id"));
  }, [board]);

  return (
    <DndContext
      onDragStart={handleDragStart}
      // thuật toán phát hiện va chạm (nếu không có nó thì card với cover lớn sẽ không kéo qua column được vì lúc này nó đang bị
      // conflict giữa card và column , chúng ta sẽ dùng closestCorners thay vì closestCenter)
      // collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
          width: "100%",
          height: (theme) => theme.trello.boardContentHeight,
          p: "10px 0",
        }}
      >
        <Box
          sx={{
            bgcolor: "inherit",
            width: "100%",
            height: "100%",
            display: "flex",
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          {/* LIST COLUMNs */}
          <ListColumns columns={orderedColumns} />
          <DragOverlay dropAnimation={dropAnimation}>
            {!activeDragItemType && null}
            {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE?.COLUMN ? (
              <Column column={activeDragItemData} />
            ) : (
              <CardItem card={activeDragItemData} />
            )}
          </DragOverlay>
        </Box>
      </Box>
    </DndContext>
  );
};

export default BoardContent;
