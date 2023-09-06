/* eslint-disable react/prop-types */
import { Avatar, AvatarGroup, Box, Button, Chip, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PublicIcon from "@mui/icons-material/Public";
import AddToDriveIcon from "@mui/icons-material/AddToDrive";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const BoardBar = ({ board }) => {
  return (
    <Box
      px={2}
      sx={{
        width: "100%",
        height: (theme) => theme.trello.boardBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "2",
        overflowX: "auto",
        borderBottom: "1px solid white",
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          icon={<DashboardIcon color="white" />}
          label={board?.title}
          clickable
          sx={{ color: "white" }}
        />
        <Chip
          icon={<PublicIcon color="white" />}
          label={board?.type}
          clickable
          sx={{ color: "white", textTransform: "capitalize" }}
        />
        <Chip
          icon={<AddToDriveIcon color="white" />}
          label="Icon"
          clickable
          sx={{ color: "white" }}
        />
        <Chip
          icon={<FlashOnIcon color="white" />}
          label="Icon"
          clickable
          sx={{ color: "white" }}
        />
        <Chip
          icon={<FilterListIcon color="white" />}
          label="Icon"
          clickable
          sx={{ color: "white" }}
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          sx={{
            color: "white",
            borderColor: "white",
            "&:hover": {
              borderColor: "white",
            },
          }}
        >
          Invite
        </Button>
        <AvatarGroup
          max={4}
          sx={{ "& .MuiAvatar-root": { width: 34, height: 34, fontSize: 16 } }}
        >
          <Tooltip title="Remy Sharp">
            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
          </Tooltip>
          <Tooltip title="Remy Sharp">
            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
          </Tooltip>
          <Tooltip title="Remy Sharp">
            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
          </Tooltip>
          <Tooltip title="Remy Sharp">
            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
          </Tooltip>
          <Tooltip title="Remy Sharp">
            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  );
};

export default BoardBar;
