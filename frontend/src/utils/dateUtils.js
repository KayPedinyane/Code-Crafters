// Date formatting utilities

export const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "numeric", month: "long", year: "numeric",
  });
};