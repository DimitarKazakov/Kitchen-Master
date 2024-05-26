import { UseFormSetValue } from 'react-hook-form';

import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import { DailyPlanFormData } from './AddDailyPlanTab';

type DaySelectProps = {
  setValue: UseFormSetValue<DailyPlanFormData>;
  formData: DailyPlanFormData;
};

export const DaySelect = (props: DaySelectProps) => {
  const { setValue, formData } = props;

  return (
    <FormControl fullWidth>
      <InputLabel id="day">Day</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="day"
        value={formData.day}
        label="Day"
        onChange={(event: SelectChangeEvent) => {
          setValue('day', event.target.value as string, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
      >
        <MenuItem value="Monday">Monday</MenuItem>
        <MenuItem value="Tuesday">Tuesday</MenuItem>
        <MenuItem value="Wednesday">Wednesday</MenuItem>
        <MenuItem value="Thursday">Thursday</MenuItem>
        <MenuItem value="Friday">Friday</MenuItem>
        <MenuItem value="Saturday">Saturday</MenuItem>
        <MenuItem value="Sunday">Sunday</MenuItem>
      </Select>
    </FormControl>
  );
};
