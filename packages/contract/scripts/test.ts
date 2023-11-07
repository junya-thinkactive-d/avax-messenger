import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import hre, { viem } from 'hardhat';
import { expect } from 'chai';
import { parseEther, formatEther } from 'viem';

describe('contract', function () {
  async function deployProjectFixture() {
    const [user1, user2] = await hre.viem.getWalletClients();
    const contract = await hre.viem.deployContract('', [], {
      value: parseEther('0.1'),
    });

    const publicClient = await hre.viem.getPublicClient();
    const contractBalance = await publicClient.getBalance({
      address: contract.address,
    });

    return { contract, contractBalance, user1, user2 };
  }

  describe('', function () {
    it('', async function () {
      const {} = await loadFixture(deployProjectFixture);
    });
  });
});
