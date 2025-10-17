export const serializeGenres = (arr: number[]) => `,${arr.join(",")},`;

export const deserializeGenres = (str?: string) =>
  str ? str.split(",").map((v) => Number(v)) : [];
