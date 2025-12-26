import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const RWABond1155 = await ethers.getContractFactory("RWABond1155");
  const contract = await RWABond1155.deploy(
    "https://example.com/metadata/{id}.json"
  );

  await contract.waitForDeployment();

  console.log("ERC1155 deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


