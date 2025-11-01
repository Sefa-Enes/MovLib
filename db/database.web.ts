// Web platform: No SQLite, use localStorage
export const db = null;

export const initDB = async () => {
  console.log("✅ Web storage ready");
  // localStorage is ready by default, no initialization needed
};
