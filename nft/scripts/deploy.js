const { ethers, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("Network:", network.name);

  const baseMetadataURI = "https://solun.art/api/nft/metadata/";

  const Factory = await ethers.getContractFactory("SOLUNACabinClub");
  const contract = await Factory.deploy(deployer.address, baseMetadataURI);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ SOLUNACabinClub deployed to:", address);
  console.log("\n👉 Add to Fly.io secrets:");
  console.log(`   fly secrets set NFT_CONTRACT_ADDRESS=${address} -a soluna-web`);
  console.log("\n👉 OpenSea collection URL (after first mint):");
  if (network.name === "base") {
    console.log(`   https://opensea.io/assets/base/${address}`);
  } else {
    console.log(`   https://testnets.opensea.io/assets/base-sepolia/${address}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
