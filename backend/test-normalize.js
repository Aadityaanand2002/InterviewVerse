  const normalizeOutput = (output) => {
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ",")
          .replace(/'/g, '"')
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };

const expected = '["o","l","l","e","h"]\n["h","a","n","n","a","H"]';
const actual = "[ 'o', 'l', 'l', 'e', 'h' ]\n[ 'h', 'a', 'n', 'n', 'a', 'H' ]";

console.log("Expected Normalized:", normalizeOutput(expected));
console.log("Actual Normalized:", normalizeOutput(actual));
console.log("Match:", normalizeOutput(expected) === normalizeOutput(actual));
