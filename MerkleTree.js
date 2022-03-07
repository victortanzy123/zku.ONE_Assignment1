const { MerkleTree } = require("merkletreejs");

const keccak256 = require("keccak256");
const { soliditySha3 } = require("web3-utils");
const bytes32 = require("bytes32");

const merkleLeaves = [
  {
    msgSender: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    receipient: "0xd8e11DCEf1ff460755E8E494AEb5185a0A3b7954",
    tokenId: 1,
    tokenURI: "ipfs://QmS4kc2FDhoh9pma2qPJpSssnasNUybRpB5mGL2MX76ZEn/1.json",
  },
  {
    msgSender: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
    receipient: "0x58E911065633526433950FB8bD5aA21a933b58Ce",
    tokenId: 2,
    tokenURI: "ipfs://QmS4kc2FDhoh9pma2qPJpSssnasNUybRpB5mGL2MX76ZEn/2.json",
  },
  {
    msgSender: "0xa76E79fb4A357A9828e5bA1843A81E253ABB3C5c",
    receipient: "0x538BB0c4CDE1Db2Fb35E7A7e4aCFE3D1f243f8B5",
    tokenId: 3,
    tokenURI: "ipfs://QmS4kc2FDhoh9pma2qPJpSssnasNUybRpB5mGL2MX76ZEn/3.json",
  },
  {
    msgSender: "0xa76E79fb4A357A9828e5bA1843A81E253ABB3C5c",
    receipient: "0x538BB0c4CDE1Db2Fb35E7A7e4aCFE3D1f243f8B5",
    tokenId: 4,
    tokenURI: "ipfs://QmS4kc2FDhoh9pma2qPJpSssnasNUybRpB5mGL2MX76ZEn/4.json",
  },
];

const leaves = merkleLeaves.map((leaf) => {
  const hash = soliditySha3(
    leaf.msgSender,
    leaf.receipient,
    leaf.tokenId,
    leaf.tokenURI
  );
  return hash;
  //   return keccak256(encodedPacked);
});
console.log("Leaves: ", leaves);

// Creating Merkle Tree with Leaves and keccak256 hashing algorithm:
const tree = new MerkleTree(leaves, keccak256, {
  sortLeaves: true,
});
const root = tree.getRoot().toString("hex");
// Retrieving a Bytes32 format for MerkleRoot:
const Bytes32root = tree.getHexRoot();
console.log("Bytes32Root: ", Bytes32root);

for (let i = 0; i < leaves.length; i++) {
  let currentLeaf = soliditySha3(
    merkleLeaves[i].msgSender,
    merkleLeaves[i].receipient,
    merkleLeaves[i].tokenId,
    merkleLeaves[i].tokenURI
  );

  const current_BYTES32_Proof = tree.getHexProof(currentLeaf);
  console.log(`Proof ${i + 1}: `, current_BYTES32_Proof);
}

let leaf = soliditySha3(
  merkleLeaves[0].msgSender,
  merkleLeaves[0].receipient,
  merkleLeaves[0].tokenId,
  merkleLeaves[0].tokenURI
);
console.log("Leaf: ", leaf);

// Retrieving Proof in Buffer form to pass into tree.verify():
const proof = tree.getProof(leaf);
// Retrieving Proof in the form of bytes32:
const BYTES32_PROOF = tree.getHexProof(leaf);
console.log("PROOF: ", BYTES32_PROOF);

console.log(tree.verify(proof, leaf, root)); // true

console.log(tree.toString());

/*

MerkleRoot: 0x5832a262b2f62b29a106eaaefa9a0b4ba5870058adba93298d62d0d001ff180c

Proof 1:
["0xdef0ceb9649c70b99cef10a057e7163961a71eb0860f8408408271c1f7b9e017","0x49b2bdb4885fa890a7218160978d8f835199293e0b7ab33fa97b3277c24f0d44"]

Proof 2:  ["0x76acc3a03ed3ddbfde39d518f28c4993917ededba7f31e88b6313da36777cfc7","0xf68c475f410682a1c359fbfb600df259a5050494c90c11bb7cf8b5ab7213eeb6"]

Proof 3:  
["0x816f892c44d4e29d8427f8068c8d4f635a40244544421671025112fbd5155e11","0x49b2bdb4885fa890a7218160978d8f835199293e0b7ab33fa97b3277c24f0d44"]

Proof 4:  ["0x604c4aa3022c5c0d5a9b51dbb713eb555ddebe0255ba9bf5691108d632365cc4","0xf68c475f410682a1c359fbfb600df259a5050494c90c11bb7cf8b5ab7213eeb6"]
*/
