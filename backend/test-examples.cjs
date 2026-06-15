const cheerio = require('cheerio');
const html = `<p>Given a signed 32-bit integer <code>x</code>, return <code>x</code><em> with its digits reversed</em>. If reversing <code>x</code> causes the value to go outside the signed 32-bit integer range <code>[-2<sup>31</sup>, 2<sup>31</sup> - 1]</code>, then return <code>0</code>.</p>

<p><strong>Assume the environment does not allow you to store 64-bit integers (signed or unsigned).</strong></p>

<p>&nbsp;</p>
<p><strong class="example">Example 1:</strong></p>

<pre>
<strong>Input:</strong> x = 123
<strong>Output:</strong> 321
</pre>

<p><strong class="example">Example 2:</strong></p>

<pre>
<strong>Input:</strong> x = -123
<strong>Output:</strong> -321
</pre>

<p><strong class="example">Example 3:</strong></p>

<pre>
<strong>Input:</strong> x = 120
<strong>Output:</strong> 21
</pre>

<p>&nbsp;</p>
<p><strong>Constraints:</strong></p>

<ul>
	<li><code>-2<sup>31</sup> &lt;= x &lt;= 2<sup>31</sup> - 1</code></li>
</ul>
`;

const $ = cheerio.load(html);

let examples = [];
$('pre').each((i, pre) => {
  let text = $(pre).text();
  let inputMatch = text.match(/Input:\s*(.*?)\n/);
  let outputMatch = text.match(/Output:\s*(.*?)(?:\n|$)/);
  let explMatch = text.match(/Explanation:\s*(.*)/s);
  
  if (inputMatch && outputMatch) {
    examples.push({
      input: inputMatch[1].trim(),
      output: outputMatch[1].trim(),
      explanation: explMatch ? explMatch[1].trim() : ""
    });
  }
});

console.log(examples);
