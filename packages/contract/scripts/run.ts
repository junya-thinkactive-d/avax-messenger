import hre from 'hardhat';
import { parseEther, formatEther } from 'viem';

const main = async () => {
  const [owner, randomPerson] = await hre.viem.getWalletClients();
  const contract = await hre.viem.deployContract('', [], {
    value: parseEther('0.1'),
  });

  console.log('Contract deployed to:', contract.address);

  const publicClient = await hre.viem.getPublicClient();

  let contractBalance = await publicClient.getBalance({
    address: contract.address,
  });

  console.log('Contract balance:', formatEther(contractBalance));

  
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
