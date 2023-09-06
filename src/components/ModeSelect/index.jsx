import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useColorScheme,
} from "@mui/material";

const ModeSelect = () => {
  const { mode, setMode } = useColorScheme();

  const handleChangeMode = () => {
    setMode(mode === "light" ? "dark" : "light");
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
      <InputLabel
        id="demo-simple-select-label"
        sx={{
          color: "white",
          "&.Mui-focused": {
            color: "white",
          },
        }}
      >
        Mode
      </InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={mode}
        label="Mode"
        onChange={handleChangeMode}
        sx={{
          color: "white",
          ".MuiOutlinedInput-notchedOutline": { borderColor: "white" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          ".MuiSvgIcon-root": { color: "white" },
        }}
      >
        <MenuItem value="light">Light</MenuItem>
        <MenuItem value="dark">Dark</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ModeSelect;
