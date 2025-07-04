// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PredictionMarket.sol";
import "./PredictionNFT.sol";

contract PredictionMarketFactory is Ownable, ReentrancyGuard {
    PredictionMarket public predictionMarket;
    PredictionNFT public predictionNFT;
    
    uint256 public constant MARKET_CREATION_FEE = 0.001 ether;
    uint256 public constant MIN_BET = 0.001 ether;
    
    event MarketFactoryCreated(address predictionMarket, address predictionNFT);
    
    constructor() Ownable(msg.sender) {
        predictionMarket = new PredictionMarket(address(this));
        predictionNFT = new PredictionNFT();
        
        emit MarketFactoryCreated(address(predictionMarket), address(predictionNFT));
    }
    
    function createMarketWithInitialBet(
        string memory _question,
        string memory _description,
        string memory _category,
        string memory _resolutionCriteria,
        uint256 _duration,
        bool /* _initialOutcome */
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= MIN_BET + MARKET_CREATION_FEE, "Insufficient payment");
        
        uint256 marketId = predictionMarket.createMarket{value: msg.value - MARKET_CREATION_FEE}(
            _question,
            _description,
            _category,
            _resolutionCriteria,
            _duration
        );
        
        return marketId;
    }
    
    // Automated market creation (for AI-generated markets)
    function createAutomatedMarket(
        string memory _question,
        string memory _description,
        string memory _category,
        string memory _resolutionCriteria,
        uint256 _duration
    ) external payable returns (uint256) {
        require(msg.sender == owner(), "Only owner can create automated markets");
        
        uint256 marketId = predictionMarket.createMarket{value: msg.value}(
            _question,
            _description,
            _category,
            _resolutionCriteria,
            _duration
        );
        
        return marketId;
    }
    
    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Getter functions
    function getPredictionMarketAddress() external view returns (address) {
        return address(predictionMarket);
    }
    
    function getPredictionNFTAddress() external view returns (address) {
        return address(predictionNFT);
    }
}