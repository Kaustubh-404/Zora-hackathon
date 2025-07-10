# 🔮 ForesightCast – Predict. Earn. Influence.

ForesightCast is an on‑chain, AI‑personalized, gamified prediction marketplace.  
Swipe through AI‑generated forecasts, mint your predictions as NFTs on Zora, and earn multi‑token rewards for accuracy, streaks, boldness, and social engagement.

---

## 🎥 Live Demo

> Click to watch the full walkthrough

[![ForesightCast Demo](https://img.youtube.com/vi/_1SKskUM3XE/hqdefault.jpg)](https://youtu.be/_1SKskUM3XE)

---

## ✨ Key Features

| Category              | Highlights                                                                 |
|-----------------------|----------------------------------------------------------------------------|
| **Prediction UX**     | Tinder‑style swipe interface, real‑time odds, expiry timers               |
| **AI Personalization**| Groq LLM + Farcaster (Neynar) to generate user‑specific markets            |
| **NFT Proof**         | Every prediction is minted on Zora Testnet                                 |
| **Reward Economy**    | Six ERC‑20 skill coins (ACC, STR, ORC, RSK, COM, Mastery) via Zora Coins   |
| **DeFi Utility**      | Trade, stake, lend, copy‑trade, join syndicates, enter gated tournaments   |
| **Social Flywheel**   | Referral mining, social sharing rewards, on‑chain leaderboards             |

---

## 🛠 Tech Stack

- **Frontend:** Vite + React 18, Tailwind CSS, Zustand, TanStack Query, Framer Motion  
- **Smart Contracts:** Foundry (Solidity), Zora Protocol SDK, Zora Coins SDK  
- **AI & Social:** Groq SDK, Farcaster graph via Neynar API  
- **Auth:** Privy (wallet+OAuth)  
- **Infra:** WebSockets for real‑time updates, IPFS for metadata

---

## ⚡ Quick Start

### 1. Clone & install

```bash
git clone https://github.com/Kaustubh-404/Zora-hackathon
cd Zora-hackathon
pnpm install
```

### 2. Configure environment

Create a file named **`.env.local`** in the project root and paste the template below, then fill in any missing values:

```env
# === ForesightCast Environment ===
VITE_PRIVY_APP_ID="cmbas00m7003pjm0mouw4toi0"
VITE_NEYNAR_API_KEY="32189CB8-38AC-40A8-B6C8-4B49E1182CE9"
VITE_GROQ_API_KEY=""
VITE_ZORA_TESTNET_RPC=https://sepolia.rpc.zora.energy
VITE_APP_NAME=ForesightCast
VITE_APP_URL=http://localhost:3000

# Zora creator wallet & API
VITE_ZORA_API_KEY="zora_api_ea5709519b9992f8a96ef0d02a81ca0125095d51138175ac3a77abb3a60e88ec"
VITE_ZORA_CREATOR_ADDRESS=your_zora_creator_address_here

# Base Sepolia RPC
VITE_BASE_RPC_URL=https://sepolia.base.org
VITE_BASE_CHAIN_ID=84532

# Uniswap V4 addresses
VITE_UNISWAP_V4_POOL_MANAGER=0x...
VITE_UNISWAP_V4_ROUTER=0x...
VITE_UNISWAP_V4_FACTORY=0x...
VITE_UNISWAP_V4_QUOTER=0x...

# Feature flags
VITE_ENABLE_COIN_TRADING=true
VITE_ENABLE_COIN_STAKING=true
VITE_ENABLE_COIN_REWARDS=true
VITE_ENABLE_UNISWAP_V4=true
```

### 3. Run the app

```bash
pnpm dev
```

Visit **http://localhost:3000** in your browser 🚀

---

## 🗺 Roadmap

- 🔵 Launch on Zora + Base testnet  
- 📱 Mobile PWA with push notifications  
- 🏆 Prediction syndicates & copy‑trading marketplace  
- 💰 Uniswap V4 liquidity pools for skill coins  
- 🗳 DAO governance powered by COM & Mastery tokens  

---

## 🧠 Credits

Built with ❤️ using:
- Zora Protocol + Zora Coins SDK  
- Groq AI + Farcaster (via Neynar)  
- Foundry, Privy, and the Web3 open ecosystem

---

### © 2025 ForesightCast
