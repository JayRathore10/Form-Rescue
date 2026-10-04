/**
 * Converts a string name to a URL/ID friendly slug: "Date of Birth" -> "date-of-birth"
 * @param {string} name
 * @returns {string}
 */
export const toFieldId = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
