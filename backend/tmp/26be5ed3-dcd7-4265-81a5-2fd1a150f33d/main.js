function reverseString(s) {
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
}

// Test cases
const test1 = ["h","e","l","l","o"];
reverseString(test1);
console.log(test1); // ["o","l","l","e","h"]

const test2 = ["H","a","n","n","a","h"];
reverseString(test2);
console.log(test2); // ["h","a","n","n","a","H"]