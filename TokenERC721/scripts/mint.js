const hre = require("hardhat");
const { encryptDataField } = require("@swisstronik/utils");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpcLink = hre.network.config.url;

  const [encryptedData] = await encryptDataField(rpcLink, data);

  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  const contractAddress = "0x095075C19431A6eC331c9bC123Fc30d749ba8aaB"; 
  const recipientAddress = "0xA89e29087853Daa5EfC7Af3C41A17e6D8F370663";

  const [signer] = await hre.ethers.getSigners();

  const contractFactory = await hre.ethers.getContractFactory("ChocoSwiss"); 
  const contract = contractFactory.attach(contractAddress);

  const functionName = "mint";
  const functionArgs = [recipientAddress]; 
  const txData = contract.interface.encodeFunctionData(functionName, functionArgs);

  try {
    console.log("Sending...");

    const mintTx = await sendShieldedTransaction(
      signer,
      contractAddress,
      txData,
      0
    );

    await mintTx.wait();

    console.log("Confirmed!");
    console.log("Receipt transaction: ", mintTx);
  } catch (error) {
    console.error("Error: ", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});