const axios = require('axios');

async function test() {
  const code = `
    function reverseString(s) {
      let left = 0; let right = s.length - 1;
      while (left < right) {
        [s[left], s[right]] = [s[right], s[left]];
        left++; right--;
      }
    }
    const test1 = ["h","e","l","l","o"];
    reverseString(test1);
    console.log(test1);
  `;
  
  const promises = [];
  for(let i=0; i<10; i++) {
    promises.push(axios.post('http://localhost:3000/api/execute', {
      language: 'javascript',
      code: code
    }));
  }
  
  try {
    const results = await Promise.all(promises);
    results.forEach((r, idx) => console.log(`Run ${idx}:`, r.data));
  } catch (e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  }
}
test();
