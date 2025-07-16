import { useEffect, useState } from "react";

export function useItemsMap() {
  const [itemsMap, setItemsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/items.json")
      .then((res) => res.json())
      .then((data) => {
        // data é um objeto { [id]: {name, ...} }
        const map: Record<string, string> = {};
        Object.keys(data).forEach((id) => {
          map[id] = data[id].name;
        });
        setItemsMap(map);
        setLoading(false);
      });
  }, []);

  return { itemsMap, loading };
}
