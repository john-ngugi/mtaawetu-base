"use client";

import { useState, useEffect } from "react";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import Button from "../components/Button";

interface Items {
  id: number;
  name: string;
  apilink: string;
  legendUrl: string | null;
}

interface Props {
  items: Items[];
  category: string;
  onClick: (name: string, apilink: string, legendUrl: string | null) => void;
}

export default function Example({ items, category, onClick }: Props) {
  const [selected, setSelected] = useState<Items | null>(null);

  useEffect(() => {
    if (items.length > 0) {
      setSelected(items[0]);
    }
  }, [items]);

  const handleChange = (newValue: Items) => {
    setSelected(newValue);
  };

  if (!selected) return <div>Loading...</div>;

  return (
    <Listbox value={selected} onChange={handleChange}>
      <Label className="block text-sm font-medium leading-6 text-indigo-400">
        {category}
      </Label>
      <div className="relative mt-2">
        <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
          <span className="flex items-center">
            <span className="block truncate">{selected.name}</span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
            <ChevronUpDownIcon
              aria-hidden="true"
              className="h-5 w-5 text-gray-400"
            />
          </span>
        </ListboxButton>

        <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {items.map((item) => (
            <ListboxOption
              key={item.id}
              value={item}
              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-700 data-[focus]:bg-indigo-600 data-[focus]:text-white"
            >
              <div className="flex items-center">
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                  <CheckIcon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="block truncate font-normal group-data-[selected]:font-semibold">
                  {item.name}
                </span>
              </div>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-[focus]:text-white">
                <Button
                  text="Add"
                  onClick={() =>
                    onClick(item.name, item.apilink, item.legendUrl)
                  }
                />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
