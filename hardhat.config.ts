// import { defineConfig } from "hardhat/config";

// export default defineConfig({
//   solidity: {
//     version: "0.8.28",
//   },
// });


import { HardhatUserConfig } from "hardhat/config";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      type: "http",
      url: process.env.AMOY_RPC_URL!,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
    },
  },
};

export default config;

