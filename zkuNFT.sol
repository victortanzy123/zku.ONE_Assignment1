// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract NFT is ERC721, Ownable {
    using Strings for uint256;

    // Set a counter for TokenID enumeration to optimise gas fees for minting:
    using Counters for Counters.Counter;
    Counters.Counter private totalMinted;

    string baseURI;
    string public baseExtension = ".json";
    uint256 public cost = 0.05 ether;
    uint256 public maxSupply = 10000;
    uint256 public maxMintAmount = 20;
    bool public paused = false;

    // Variable to save merkle root:
    bytes32 public merkleRoot;

    // Mapping to denote which NFT has been minted:
    mapping(uint256 => bool) public tokenIdHasMinted;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initBaseURI
    ) ERC721(_name, _symbol) {
        setBaseURI(_initBaseURI);
    }

    // internal
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    // public
    function mint(
        bytes32[] calldata _merkleProof,
        uint256 _tokenId,
        address _recipient
    ) public payable {
        require(!paused);
        require(totalMinted.current() + 1 <= maxSupply);
        require(_recipient != address(0));

        // Check if the price was paid corrected for the minted NFT:
        require(msg.value == cost, "Invalid amount.");

        // Check if the tokenId has been minted by the assigned owner:
        require(
            !tokenIdHasMinted[_tokenId],
            "This token has been minted by its assigned owner."
        );

        string memory currentTokenURI = tokenURI(_tokenId);

        // Compute the Hash for this particular mint transaction:
        bytes32 merkleLeaf = keccak256(
            abi.encodePacked(msg.sender, _recipient, _tokenId, currentTokenURI)
        );

        // Function to verify merkleHash with Merkle Tree:
        require(MerkleProof.verify(_merkleProof, merkleRoot, merkleLeaf));

        _safeMint(_recipient, _tokenId);

        // Update the respective state counters:
        totalMinted.increment();
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    function currentSupply() public view returns (uint256) {
        return totalMinted.current();
    }

    function setMerkleRoot(bytes32 _newMerkleRoot) public onlyOwner {
        merkleRoot = _newMerkleRoot;
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
        maxMintAmount = _newmaxMintAmount;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension)
        public
        onlyOwner
    {
        baseExtension = _newBaseExtension;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function withdraw() public payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
