import hre from 'hardhat';
import { parseEther } from 'viem';

const main = async () => {
  const publicClient = await hre.viem.getPublicClient();
  const [deployer] = await hre.viem.getWalletClients();
  const accountBalance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  const contract = await hre.viem.deployContract('', [], {
    value: parseEther('0.1'),
  });

  console.log('Deploying contracts with account:', deployer.account.address);
  console.log('Account balance:', accountBalance.toString());
  console.log('Contract deployed to:', contract.address);
  console.log('Contract deployed by:', deployer.account.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
