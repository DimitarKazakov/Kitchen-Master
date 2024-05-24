import { useState } from 'react';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Checkbox,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

type FilterItemsProps = {
  header: string;
  filters: {
    label: string;
    value: string;
  }[];
  localFilters: string[];
  push: (value: string) => void;
  remove: (value: string) => void;
};

export const FilterItems = (props: FilterItemsProps) => {
  const { header, filters, localFilters, push, remove } = props;
  const [open, setOpen] = useState(filters.some((x) => localFilters.includes(x.value)));

  return (
    <List>
      <ListItem key={header} disablePadding>
        <ListItemButton
          role={undefined}
          onClick={() => {
            setOpen(!open);
          }}
          dense
        >
          <ListItemText id={header} primary={header} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {filters.map((x) => (
            <ListItem key={x.value} disablePadding>
              <ListItemButton
                role={undefined}
                onClick={() => {
                  if (localFilters.includes(x.value)) {
                    remove(x.value);
                  } else {
                    push(x.value);
                  }
                }}
                dense
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={localFilters.includes(x.value)}
                    tabIndex={-1}
                    disableRipple
                    onClick={() => {
                      if (localFilters.includes(x.value)) {
                        remove(x.value);
                      } else {
                        push(x.value);
                      }
                    }}
                  />
                </ListItemIcon>
                <ListItemText id={x.value} primary={x.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </List>
  );
};
