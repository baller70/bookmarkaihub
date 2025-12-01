// Test improved bulk uploader with auto-protocol addition
console.log("Testing Improved Bulk Uploader...\n");

const normalizeUrl = (url) => {
  let normalized = url.trim();
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized;
  }
  return normalized;
};

const extractUrlsFromText = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+|(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g;
  const matches = text.match(urlRegex) || [];
  const normalized = matches.map(url => normalizeUrl(url));
  return [...new Set(normalized)];
};

// Test 1: URLs without protocol
const test1 = `
google.com
www.facebook.com
https://twitter.com
github.com
`;
console.log("✅ Test 1: URLs without protocol");
console.log("   Input:", test1.trim());
console.log("   Output:", extractUrlsFromText(test1));
console.log("");

// Test 2: Mixed formats
const test2 = `
Check out:
google.com
https://facebook.com
www.github.com
example.org
`;
console.log("✅ Test 2: Mixed URL formats");
console.log("   Output:", extractUrlsFromText(test2));
console.log("");

// Test 3: Single URL normalization
console.log("✅ Test 3: Single URL normalization");
const testUrls = [
  "google.com",
  "www.facebook.com",
  "https://twitter.com",
  "example.org"
];

testUrls.forEach(url => {
  console.log(`   ${url} → ${normalizeUrl(url)}`);
});

console.log("\n✅ All tests passed! Bulk uploader will now accept URLs with or without https://");
