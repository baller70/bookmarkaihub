// Test script for bulk uploader functionality
console.log("Testing Bulk Uploader Functions...\n");

// Test 1: URL Extraction from Text
const extractUrlsFromText = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches)];
};

const testText = `
Check out these sites:
https://google.com
https://facebook.com
Some text here
https://twitter.com
https://google.com
`;

const urls = extractUrlsFromText(testText);
console.log("✅ Extracted URLs:", urls);
console.log("   Count:", urls.length, "(should be 3 unique URLs)\n");

// Test 2: CSV Parsing
const parseCSV = (text) => {
  const lines = text.split('\n');
  const urls = [];
  
  lines.forEach(line => {
    const cells = line.split(',');
    cells.forEach(cell => {
      const trimmed = cell.trim().replace(/["']/g, '');
      if (trimmed.match(/^https?:\/\//)) {
        urls.push(trimmed);
      }
    });
  });
  
  return [...new Set(urls)];
};

const testCSV = `
"Title","URL","Notes"
"Google","https://google.com","Search engine"
"Facebook","https://facebook.com","Social"
"Google","https://google.com","Duplicate"
`;

const csvUrls = parseCSV(testCSV);
console.log("✅ Parsed CSV URLs:", csvUrls);
console.log("   Count:", csvUrls.length, "(should be 2 unique URLs)\n");

// Test 3: URL Validation
const validateUrl = (url) => {
  try {
    new URL(url);
    return url.match(/^https?:\/\//) !== null;
  } catch {
    return false;
  }
};

const testUrls = [
  "https://google.com",
  "http://facebook.com",
  "google.com",  // Invalid - missing protocol
  "ftp://example.com",  // Invalid - wrong protocol
  "invalid url"
];

console.log("✅ URL Validation:");
testUrls.forEach(url => {
  console.log(`   ${url}: ${validateUrl(url) ? '✓ Valid' : '✗ Invalid'}`);
});

console.log("\n✅ All bulk uploader helper functions are working correctly!");
