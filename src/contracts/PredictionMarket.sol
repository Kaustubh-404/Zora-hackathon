// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PredictionMarket is ReentrancyGuard {
    struct Market {
        string question;
        string description;
        string category;
        string resolutionCriteria;
        uint256 endTime;
        uint256 totalYesAmount;
        uint256 totalNoAmount;
        bool resolved;
        bool outcome; // true = Yes wins, false = No wins
        address creator;
        uint256 createdAt;
        bool active;
    }
    
    struct Bet {
        address bettor;
        uint256 amount;
        bool outcome; // true = Yes, false = No
        uint256 timestamp;
        bool claimed;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Bet[]) public marketBets;
    mapping(uint256 => mapping(address => uint256[])) public userBets; // marketId => user => bet indices
    
    uint256 public marketCounter;
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 1 ether;
    uint256 public constant PLATFORM_FEE = 200; // 2% (in basis points)
    
    address public feeRecipient;
    
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string question,
        uint256 endTime
    );
    
    event BetPlaced(
        uint256 indexed marketId,
        address indexed bettor,
        uint256 amount,
        bool outcome
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        bool outcome,
        uint256 totalPayout
    );
    
    event RewardClaimed(
        uint256 indexed marketId,
        address indexed winner,
        uint256 amount
    );
    
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }
    
    function createMarket(
        string memory _question,
        string memory _description,
        string memory _category,
        string memory _resolutionCriteria,
        uint256 _duration // in seconds
    ) external payable returns (uint256) {
        require(bytes(_question).length > 0, "Question cannot be empty");
        require(_duration >= 1 hours, "Duration too short");
        require(_duration <= 365 days, "Duration too long");
        
        uint256 marketId = marketCounter++;
        uint256 endTime = block.timestamp + _duration;
        
        markets[marketId] = Market({
            question: _question,
            description: _description,
            category: _category,
            resolutionCriteria: _resolutionCriteria,
            endTime: endTime,
            totalYesAmount: 0,
            totalNoAmount: 0,
            resolved: false,
            outcome: false,
            creator: msg.sender,
            createdAt: block.timestamp,
            active: true
        });
        
        emit MarketCreated(marketId, msg.sender, _question, endTime);
        
        // If initial liquidity provided, place creator bet
        if (msg.value >= MIN_BET) {
            _placeBet(marketId, true, msg.value); // Default to Yes bet
        }
        
        return marketId;
    }
    
    function placeBet(uint256 _marketId, bool _outcome) external payable nonReentrant {
        require(msg.value >= MIN_BET, "Bet too small");
        require(msg.value <= MAX_BET, "Bet too large");
        
        _placeBet(_marketId, _outcome, msg.value);
    }
    
    function _placeBet(uint256 _marketId, bool _outcome, uint256 _amount) internal {
        Market storage market = markets[_marketId];
        require(market.active, "Market not active");
        require(block.timestamp < market.endTime, "Market ended");
        require(!market.resolved, "Market resolved");
        
        // Update market totals
        if (_outcome) {
            market.totalYesAmount += _amount;
        } else {
            market.totalNoAmount += _amount;
        }
        
        // Record bet
        Bet memory newBet = Bet({
            bettor: msg.sender,
            amount: _amount,
            outcome: _outcome,
            timestamp: block.timestamp,
            claimed: false
        });
        
        marketBets[_marketId].push(newBet);
        userBets[_marketId][msg.sender].push(marketBets[_marketId].length - 1);
        
        emit BetPlaced(_marketId, msg.sender, _amount, _outcome);
    }
    
    function resolveMarket(uint256 _marketId, bool _outcome) external {
        Market storage market = markets[_marketId];
        require(msg.sender == market.creator || msg.sender == feeRecipient, "Not authorized");
        require(block.timestamp >= market.endTime, "Market not ended");
        require(!market.resolved, "Already resolved");
        
        market.resolved = true;
        market.outcome = _outcome;
        
        uint256 totalPool = market.totalYesAmount + market.totalNoAmount;
        emit MarketResolved(_marketId, _outcome, totalPool);
    }
    
    function claimReward(uint256 _marketId) external nonReentrant {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved");
        
        uint256[] memory betIndices = userBets[_marketId][msg.sender];
        require(betIndices.length > 0, "No bets found");
        
        uint256 totalReward = 0;
        uint256 userWinningBets = 0;
        
        // Calculate user's winning amount
        for (uint256 i = 0; i < betIndices.length; i++) {
            Bet storage bet = marketBets[_marketId][betIndices[i]];
            
            if (!bet.claimed && bet.outcome == market.outcome) {
                bet.claimed = true;
                userWinningBets += bet.amount;
            }
        }
        
        if (userWinningBets > 0) {
            uint256 totalPool = market.totalYesAmount + market.totalNoAmount;
            uint256 winningPool = market.outcome ? market.totalYesAmount : market.totalNoAmount;
            
            // Calculate proportional reward
            totalReward = (userWinningBets * totalPool) / winningPool;
            
            // Deduct platform fee
            uint256 fee = (totalReward * PLATFORM_FEE) / 10000;
            totalReward -= fee;
            
            require(totalReward > 0, "No reward to claim");
            
            // Transfer reward
            payable(msg.sender).transfer(totalReward);
            payable(feeRecipient).transfer(fee);
            
            emit RewardClaimed(_marketId, msg.sender, totalReward);
        }
    }
    
    // View functions
    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }
    
    function getMarketBets(uint256 _marketId) external view returns (Bet[] memory) {
        return marketBets[_marketId];
    }
    
    function getUserBets(uint256 _marketId, address _user) external view returns (uint256[] memory) {
        return userBets[_marketId][_user];
    }
    
    function getMarketOdds(uint256 _marketId) external view returns (uint256 yesPercentage, uint256 noPercentage) {
        Market memory market = markets[_marketId];
        uint256 total = market.totalYesAmount + market.totalNoAmount;
        
        if (total == 0) {
            return (50, 50);
        }
        
        yesPercentage = (market.totalYesAmount * 100) / total;
        noPercentage = 100 - yesPercentage;
    }
    
    function getTotalLiquidity(uint256 _marketId) external view returns (uint256) {
        Market memory market = markets[_marketId];
        return market.totalYesAmount + market.totalNoAmount;
    }
    
    function getAllActiveMarkets() external view returns (uint256[] memory) {
        uint256[] memory activeMarkets = new uint256[](marketCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < marketCounter; i++) {
            if (markets[i].active && !markets[i].resolved) {
                activeMarkets[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeMarkets[i];
        }
        
        return result;
    }
}