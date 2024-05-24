import { Dispatch, SetStateAction } from 'react';

import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
} from '@mui/material';

type IngredientsSelectProps = {
  title: string;
  selectedIngredients: string[];
  setSelectedIngredients: Dispatch<SetStateAction<string[]>>;
};

const ITEM_HEIGHT = 90;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ingredients = [
  'Chicken',
  'Fish',
  'Pork',
  'Veal',
  'Lamb',
  'Bacon',
  'Minced Meat',
  'Fillet',
  'Ham',
  'Sausage',
  'Steak',
  'Tomato',
  'Cucumber',
  'Cabbage',
  'Iceberg',
  'Onion',
  'Potato',
  'Pepper',
  'Garlic',
  'Avocado',
  'Carrot',
  'Corn',
  'Pumpkin',
  'Broccoli',
  'Peach',
  'Apple',
  'Pear',
  'Lemon',
  'Lime',
  'Grapes',
  'Apricot',
  'Banana',
  'Orange',
  'Tangerine',
  'Strawberry',
  'Pineapple',
  'Blueberry',
  'Raspberry',
  'Watermelon',
  'Melon',
  'Eggs',
  'Cottage Cheese',
  'Cheese',
  'Butter',
  'Milk',
  'Yogurt',
  'Cream',
  'Sour milk',
  'Chocolate',
  'Vanilla',
  'Caramel',
  'Cinnamon',
  'Cake',
  'Oreo',
  'Ice cream',
  'Muffin',
  'Sugar',
  'Tea',
  'Coffee',
  'Juice',
  'Fresh',
  'Coca Cola',
  'Vodka',
  'Whiskey',
  'Beer',
  'Gin',
  'Tonic',
  'Tequila',
  'Rum',
  'Liqueur',
];

export const IngredientsSelect = (props: IngredientsSelectProps) => {
  const { title, selectedIngredients, setSelectedIngredients } = props;

  const handleChange = (event: SelectChangeEvent<typeof selectedIngredients>) => {
    const {
      target: { value },
    } = event;
    setSelectedIngredients(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-checkbox-label">{title}</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={selectedIngredients}
          onChange={handleChange}
          input={<OutlinedInput label="Tag" />}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {ingredients.map((ingredient) => (
            <MenuItem key={ingredient} value={ingredient}>
              <Checkbox checked={selectedIngredients.indexOf(ingredient) > -1} />
              <ListItemText primary={ingredient} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
