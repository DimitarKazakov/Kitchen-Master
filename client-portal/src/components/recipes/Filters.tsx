import { Dispatch, SetStateAction } from 'react';

import { Box, Button, Divider } from '@mui/material';

import { useArray } from '../../hooks/useArray';
import { FilterItems } from './FilterItems';

type FiltersProps = {
  currentFilters: string[];
  setCurrentFilters: Dispatch<SetStateAction<string[]>>;
  setOpenFilters: Dispatch<SetStateAction<boolean>>;
};

type FilterItem = {
  label: string;
  value: string;
};

const popularFilters: FilterItem[] = [
  { label: 'Breakfast', value: 'закуска' },
  { label: 'Lunch', value: 'обяд' },
  { label: 'Dinner', value: 'вечеря' },
  { label: 'Dessert', value: 'десерт' },
  { label: 'Salad', value: 'салата' },
  { label: 'Bites', value: 'разядка' },
  { label: 'Cocktail', value: 'коктейл' },
  { label: 'Soup', value: 'супа' },
  { label: 'Vegan', value: 'веган' },
  { label: 'Vegetarian', value: 'вегетарианск' },
  { label: 'Meat', value: 'месо' },
  { label: 'Fish', value: 'риба' },
  { label: 'Chicken', value: 'пиле' },
  { label: 'Pork', value: 'свин' },
  { label: 'Veal', value: 'телеш' },
  { label: 'Chocolate', value: 'шоколад' },
  { label: 'Cake', value: 'кекс' },
  { label: 'Cream', value: 'крем' },
];

const meatFilters: FilterItem[] = [
  { label: 'Chicken', value: 'пиле' },
  { label: 'Fish', value: 'риба' },
  { label: 'Pork', value: 'свин' },
  { label: 'Veal', value: 'телеш' },
  { label: 'Lamb', value: 'агне' },
  { label: 'Bacon', value: 'бекон' },
  { label: 'Minced Meat', value: 'кайма' },
  { label: 'Fillet', value: 'филе' },
  { label: 'Ham', value: 'шунка' },
  { label: 'Sausage', value: 'салам' },
  { label: 'Steak', value: 'стек' },
];

const vegetablesFilters: FilterItem[] = [
  { label: 'Tomato', value: 'домат' },
  { label: 'Cucumber', value: 'краставиц' },
  { label: 'Cabbage', value: 'зеле' },
  { label: 'Iceberg', value: 'айсберг' },
  { label: 'Onion', value: 'лук' },
  { label: 'Potato', value: 'картоф' },
  { label: 'Pepper', value: 'чушк' },
  { label: 'Garlic', value: 'чесън' },
  { label: 'Avocado', value: 'авокадо' },
  { label: 'Carrot', value: 'марков' },
  { label: 'Corn', value: 'царевиц' },
  { label: 'Pumpkin', value: 'тикв' },
  { label: 'Broccoli', value: 'брокол' },
];

const fruitFilters: FilterItem[] = [
  { label: 'Peach', value: 'прасков' },
  { label: 'Apple', value: 'ябълк' },
  { label: 'Pear', value: 'круш' },
  { label: 'Lemon', value: 'лимон' },
  { label: 'Lime', value: 'лайм' },
  { label: 'Grapes', value: 'грозде' },
  { label: 'Apricot', value: 'кайси' },
  { label: 'Banana', value: 'банан' },
  { label: 'Orange', value: 'портокал' },
  { label: 'Tangerine', value: 'мандарин' },
  { label: 'Strawberry', value: 'ягод' },
  { label: 'Pineapple', value: 'ананас' },
  { label: 'Blueberry', value: 'боровинк' },
  { label: 'Raspberry', value: 'малин' },
  { label: 'Watermelon', value: 'диня' },
  { label: 'Melon', value: 'пъпеш' },
];

const dairyFilters: FilterItem[] = [
  { label: 'Eggs', value: 'яйца' },
  { label: 'Cottage Cheese', value: 'сирене' },
  { label: 'Cheese', value: 'кашкавал' },
  { label: 'Butter', value: 'масло' },
  { label: 'Milk', value: 'мляко' },
  { label: 'Yogurt', value: 'йогурт' },
  { label: 'Cream', value: 'сметана' },
  { label: 'Sour milk', value: 'кисело мляко' },
  { label: 'Margarine', value: 'маргарин' },
];

const sweetFilters: FilterItem[] = [
  { label: 'Chocalate', value: 'шоколад' },
  { label: 'Vanilla', value: 'ванилия' },
  { label: 'Caramel', value: 'карамел' },
  { label: 'Cocoa', value: 'какао' },
  { label: 'Cinnamon', value: 'канела' },
  { label: 'Cake', value: 'торта' },
  { label: 'Ice cream', value: 'сладолед' },
  { label: 'Muffin', value: 'мъфин' },
  { label: 'Oreo', value: 'орео' },
  { label: 'Sugar', value: 'захар' },
  { label: 'Cream', value: 'крем' },
];

const beveragesFilters: FilterItem[] = [
  { label: 'Tea', value: 'чай' },
  { label: 'Coffee', value: 'кафе' },
  { label: 'Water', value: 'вода' },
  { label: 'Juice', value: 'сок' },
  { label: 'Fresh', value: 'фреш' },
  { label: 'Coca Cola', value: 'кола' },
  { label: 'Vodka', value: 'водка' },
  { label: 'Whiskey', value: 'уиски' },
  { label: 'Beer', value: 'бира' },
  { label: 'Gin', value: 'джин' },
  { label: 'Tonic', value: 'тоник' },
  { label: 'Tequila', value: 'текила' },
  { label: 'Rum', value: 'ром' },
  { label: 'Liqueur', value: 'ликьор' },
];

export const Filters = (props: FiltersProps) => {
  const { currentFilters, setCurrentFilters, setOpenFilters } = props;

  const { array: localFilters, push, remove } = useArray<string>(currentFilters);

  return (
    <Box sx={{ width: 350, marginTop: '10px', marginBottom: '10px' }} role="presentation">
      <Button
        sx={{ marginLeft: '10px', marginBottom: '10px' }}
        onClick={() => {
          setCurrentFilters(localFilters);
          setOpenFilters(false);
        }}
        variant="contained"
      >
        Apply Filters
      </Button>

      <Button
        sx={{ marginLeft: '10px', marginBottom: '10px' }}
        onClick={() => {
          setCurrentFilters([]);
          setOpenFilters(false);
        }}
        variant="contained"
      >
        Clear All Filters
      </Button>

      <FilterItems
        header="Popular Filters"
        localFilters={localFilters}
        push={push}
        remove={remove}
        filters={popularFilters}
      />

      <Divider />

      <FilterItems
        header="Meats"
        localFilters={localFilters}
        push={push}
        remove={remove}
        filters={meatFilters}
      />

      <Divider />

      <FilterItems
        header="Vegetables"
        localFilters={localFilters}
        push={push}
        remove={remove}
        filters={vegetablesFilters}
      />

      <Divider />

      <FilterItems
        header="Fruits"
        localFilters={localFilters}
        push={push}
        remove={remove}
        filters={fruitFilters}
      />

      <Divider />

      <FilterItems
        header="Dairy Products"
        localFilters={localFilters}
        push={push}
        remove={remove}
        filters={dairyFilters}
      />

      <Divider />

      <FilterItems
        header="Sweets"
        localFilters={localFilters}
        push={push}
        remove={remove}
        filters={popularFilters}
      />

      <Divider />

      <FilterItems
        header="Drinks"
        localFilters={localFilters}
        push={push}
        remove={remove}
        filters={popularFilters}
      />
    </Box>
  );
};
