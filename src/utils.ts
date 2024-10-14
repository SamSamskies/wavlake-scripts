export const getCurrentDateUtc = () => {
  return new Date().toISOString().split("T")[0];
};
