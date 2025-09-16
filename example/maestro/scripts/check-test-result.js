/*
  This script is invoked by Maestro's runScript step right after copyTextFrom.
  Maestro exports the last copied text as the environment variable maestro.copiedText.
  We parse the status string from HybridObjectTestsScreen, which looks like:
    - "✅ Passed X/Y tests."
    - "✅ Passed X/Y tests, ❌ failed Z/Y tests."
    - "❌ Failed Z/Y tests."
    - "⏳ Running A/Y tests..." (transient)
    - "📱 Idle"
  We require pass percentage from env variable passThreshold to succeed.
*/



function fail(message) {
  throw new Error(message);
}

const passThreshold = passThresholdFromEnv || 80;
var src = maestro.copiedText;
if (!src) {
  fail('No copied status text found in maestro.copiedText.');
}

// Try to extract numbers from known patterns
// Pattern 1/2: "✅ Passed X/Y" possibly followed by more text
var passMatch = src.match(/✅\s*Passed\s+(\d+)\s*\/\s*(\d+)/);
// Pattern 3: only failures visible: "❌ Failed Z/Y"
var failOnlyMatch = src.match(/❌\s*Failed\s+(\d+)\s*\/\s*(\d+)/);

var passed = 0;
var total = 0;

if (passMatch) {
  passed = parseInt(passMatch[1], 10);
  total = parseInt(passMatch[2], 10);
} else if (failOnlyMatch) {
  var failed = parseInt(failOnlyMatch[1], 10);
  total = parseInt(failOnlyMatch[2], 10);
  passed = Math.max(0, total - failed);
} else {
  fail('Could not parse status text: "' + src + '"');
}

if (!isFinite(passed) || !isFinite(total) || total <= 0) {
  fail('Invalid numbers parsed. passed=' + passed + ', total=' + total + ', from: "' + src + '"');
}

var percentage = (passed / total) * 100;

console.log('Parsed result: passed=' + passed + ', total=' + total + ', pass%=' + percentage.toFixed(2) + '%');

if (percentage > passThreshold) {
  console.log('Pass threshold met'+ " (" + passThreshold + "%)");
 
} else {
  fail('Pass threshold NOT met'+ " (" + passThreshold + "%)");
}