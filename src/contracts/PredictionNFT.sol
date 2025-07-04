// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PredictionNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    struct PredictionData {
        uint256 marketId;
        address predictor;
        string question;
        bool outcome;
        uint256 timestamp;
        bool correct;
    }
    
    mapping(uint256 => PredictionData) public predictions;
    
    event PredictionNFTMinted(
        uint256 indexed tokenId,
        address indexed predictor,
        uint256 indexed marketId,
        bool correct
    );
    
    constructor() ERC721("ForesightCast Predictions", "FCPRED") Ownable(msg.sender) {}
    
    function mintPredictionNFT(
        address _predictor,
        uint256 _marketId,
        string memory _question,
        bool _outcome,
        bool _correct,
        string memory _tokenURI
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        
        predictions[tokenId] = PredictionData({
            marketId: _marketId,
            predictor: _predictor,
            question: _question,
            outcome: _outcome,
            timestamp: block.timestamp,
            correct: _correct
        });
        
        _safeMint(_predictor, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        emit PredictionNFTMinted(tokenId, _predictor, _marketId, _correct);
        
        return tokenId;
    }
    
    function getPredictionData(uint256 _tokenId) external view returns (PredictionData memory) {
        require(tokenExists(_tokenId), "Token does not exist");
        return predictions[_tokenId];
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    // Remove the _burn override as it's causing conflicts
    // The parent contracts handle burning correctly
    
    function tokenExists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}