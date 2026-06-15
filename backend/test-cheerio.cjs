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

// We need to separate:
// 1. Description (everything before the first Example or Constraints)
// 2. Constraints (the text of li elements under the ul following Constraints:)

// Let's iterate through top level elements
let descriptionHtml = '';
let inDescription = true;
const constraints = [];

$('body').children().each((i, el) => {
  const text = $(el).text();
  if (text.includes('Example 1:') || text.includes('Constraints:')) {
    inDescription = false;
  }
  
  if (inDescription) {
    descriptionHtml += $.html(el) + '\n';
  }
});

// For constraints, let's find the 'Constraints:' text and get the next ul
$('ul').each((i, ul) => {
  const prev = $(ul).prev('p');
  if (prev.text().includes('Constraints:')) {
    $(ul).find('li').each((j, li) => {
      constraints.push($(li).text().trim());
    });
  }
});

console.log("DESC:\n", descriptionHtml);
console.log("CONST:\n", constraints);

