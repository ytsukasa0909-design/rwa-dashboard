require("dotenv").config();
const { ethers } = require("ethers");

async function testRPC() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.AMOY_RPC_URL);

    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();

    console.log("RPC 接続成功 ✅");
    console.log("Network:", network.name);
    console.log("ChainId:", network.chainId.toString());
    console.log("Latest Block:", blockNumber);
  } catch (err) {
    console.error("RPC 接続失敗 ❌");
    console.error(err);
  }
}

testRPC();
