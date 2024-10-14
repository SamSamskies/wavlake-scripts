export const printCurrentLocalDate = () => {
  return `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1,
  ).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
};
