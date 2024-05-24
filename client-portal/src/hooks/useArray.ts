import { useState } from 'react';

export const useArray = <TValue>(defaultValue: TValue[] = []) => {
  const [array, setArray] = useState<TValue[]>(defaultValue);

  const push = (value: TValue) => {
    setArray((x) => [...x, value]);
  };

  const remove = (value: TValue) => {
    const index = array.indexOf(value);
    setArray((x) => [...x.slice(0, index), ...x.slice(index + 1, x.length)]);
  };

  function filter(predicate: (value: TValue, index: number, array: TValue[]) => value is TValue) {
    setArray((x) => x.filter(predicate));
  }

  const clear = () => {
    setArray([]);
  };

  return { array, set: setArray, push, remove, clear, filter };
};
