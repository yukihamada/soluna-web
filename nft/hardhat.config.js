require("@nomicfoundation/hardhat-toolbox");

const MINTER_PRIVATE_KEY = process.env.MINTER_PRIVATE_KEY || "0x" + "0".repeat(64);

module.exports = {
  solidity: "0.8.20",
  networks: {
    // Base Sepolia testnet (free, get ETH from https://www.alchemy.com/faucets/base-sepolia)
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [MINTER_PRIVATE_KEY],
      chainId: 84532,
    },
    // Base mainnet
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: [MINTER_PRIVATE_KEY],
      chainId: 8453,
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};
