// app/store/movieStore.ts

const itemCache: Record<number, Movie | Tv> = {};

export function setItem(id: number, data: Movie | Tv): void {
  console.log("data: " + JSON.stringify(data, null, 2));

  itemCache[id] = data;
}

export function getItem(id: number): Movie | Tv | undefined {
  return itemCache[id];
}
