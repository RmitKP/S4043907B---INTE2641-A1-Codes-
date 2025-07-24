// Q2: Merkle Tree

const crypto = require('crypto');

// compute SHA-256 hash of a string to hex output
function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Build Merkle Tree and return the root hash
function computeMerkleRoot(items) {
  if (items.length === 0) return null;
  // hash each input to create the leaf nodes
  let level = items.map(x => sha256Hex(x));

  // build tree upwards until only the root remains
  while (level.length > 1) {
    if (level.length % 2 === 1) {
      // if there's an odd number of nodes, duplicate the last one for merkle padding
      level.push(level[level.length - 1]);
    }
    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      // pair up adjacent hashes and hash them together
      const combined = level[i] + level[i + 1];
      nextLevel.push(sha256Hex(combined));
    }
    level = nextLevel; // move up one level
  }
  return level[0];  // final hash is the Merkle root
}

// Generate a Merkle proof for the item at index `idx`
function getMerkleProof(items, idx) {
  let level = items.map(x => sha256Hex(x));
  const proof = []; // will store sibling hashes and their position (left/right)

  while (level.length > 1) {
    if (level.length % 2 === 1) {
      // same as before, pad with duplicate if odd number of nodes
      level.push(level[level.length - 1]);
    }

    // figure out whether the current node is on the left or right
    const isRightNode = (idx % 2) === 1;
    const pairIdx = isRightNode ? idx - 1 : idx + 1;

    // store sibling hash and its position
    proof.push({
      hash: level[pairIdx],
      position: isRightNode ? 'left' : 'right'
    });

    // move up to parent node
    idx = Math.floor(idx / 2);

    // build next level of the tree
    const nextLevel = [];
    for (let i = 0; i < level.length; i += 2) {
      nextLevel.push(sha256Hex(level[i] + level[i + 1]));
    }
    level = nextLevel;
  }
  return proof;
}

// verify a Merkle proof for item against the given root
function verifyMerkleProof(item, proof, root) {
  let hash = sha256Hex(item); // start with the hash of the item itself

  // go up the tree using the proof to rebuild the path to the root
  proof.forEach(node => {
    if (node.position === 'left') {
      // if sibling is on the left, concat sibling + current
      hash = sha256Hex(node.hash + hash);
    } else {
      // if sibling is on the right, concat current + sibling
      hash = sha256Hex(hash + node.hash);
    }
  });

  // if final result equals the root, the proof is valid
  return hash === root;
}

// testing:
const txIds = ["tx1", "tx2", "tx3", "tx4", "tx5"]; // sample transaction IDs (odd to show padding)
console.log("Transactions:", txIds);

const root = computeMerkleRoot(txIds); // build Merkle tree and get the root
console.log("Merkle Root:", root);

// Generate and verify proof for a specific leaf ( index 2 to "tx3")
const idx = 2;
const proof = getMerkleProof(txIds, idx); // get the proof for tx3
console.log(`Proof for tx index ${idx} ("${txIds[idx]}"):`, proof);

const valid = verifyMerkleProof(txIds[idx], proof, root); // verify proof
console.log(`Verification result: ${valid}`); // true if valid
