// Q1: Hash

const crypto = require('crypto');
const readline = require('readline');

// Function to compute SHA-256 hash of a string
function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Function to compute Hamming distance between two hashes to show avalanche effect
function hammingDistance(hashA, hashB) {
  const bufA = Buffer.from(hashA, 'hex');
  const bufB = Buffer.from(hashB, 'hex');
  let dist = 0;
  for (let i = 0; i < bufA.length; i++) {
    let xor = bufA[i] ^ bufB[i]; //Find different bits
    while (xor) {
      dist += xor & 1; //count 1s
      xor >>= 1; 
    }
  }
  return dist;
}

// Convert hex to binary for visual bit by bit comparison
function hexToBinary(hex) {
  return hex.split('').map(c =>
    parseInt(c, 16).toString(2).padStart(4, '0') //convert each hex digit to 4 bit binary
  ).join('');
}

// Prompt for user input
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Enter string to hash: ", (originalStr) => {

  // hash the user input
  const origHash = sha256Hex(originalStr);
  console.log(`Input String: ${originalStr}`);
  console.log(`SHA-256 hash: ${origHash}`);

  // flip the first character to change hash
  let modifiedStr = originalStr;
  if (originalStr.length > 0) {
    const firstChar = originalStr[0];
    modifiedStr = (firstChar === 'a' ? 'b' : 'a') + originalStr.slice(1); // if it starts with 'a' change to 'b', otherwise change first letter to 'a'
  }
  const modHash = sha256Hex(modifiedStr);
  console.log(`\nModified string: ${modifiedStr}`);
  console.log(`SHA-256 of modified: ${modHash}`);

  // Calculate and display the Hamming distance between the two hashes
  const dist = hammingDistance(origHash, modHash);
  const totalBits = origHash.length * 4; // 64 hex chars × 4 = 256 bits
  const percentChanged = (dist / totalBits) * 100;

  console.log(`Hamming distance: ${dist} bits`);
  console.log(`Out of total: ${totalBits} bits`);
  console.log(`Bit difference: ${percentChanged.toFixed(2)}%`);

  // Bit-by-bit difference visualization
  const binOrig = hexToBinary(origHash);
  const binMod = hexToBinary(modHash);

  console.log(`\nBit-by-bit comparison (red = changed bits):`);
  for (let i = 0; i < binOrig.length; i++) {
    const bitSame = binOrig[i] === binMod[i];
    process.stdout.write(bitSame ? binOrig[i] : `\x1b[31m${binOrig[i]}\x1b[0m`); // Print changed bits in red 
  }
  console.log(); 

  // Pre-image resistance demonstration
  console.log("\n Pre-image Resistance");
  const target = originalStr; // Try to brute force the user's input hash
  const targetHash = sha256Hex(target);
  console.log(`Target string        : "${target}"`);
  console.log(`Target SHA-256 hash  : ${targetHash}`);
  
  let found = false;
  const maxTries = 100000;  // amount of attempts
  for (let i = 0; i < maxTries; i++) {
    const candidate = Math.random().toString(36).slice(2, 10); // random 8-char string
    if (sha256Hex(candidate) === targetHash) {
      console.log(`\n Match found "${candidate}" after ${i + 1} tries`);
      found = true;
      break;
    }
  }
  if (!found) {
    console.log(`\n No match found after ${maxTries} attempts.`);
  }

  rl.close();
});
