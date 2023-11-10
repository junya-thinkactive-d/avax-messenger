import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import hre from 'hardhat';
import { getAddress } from 'viem';

describe('Messenger', function () {
  async function deployContract() {
    const [owner, otherAccount] = await hre.viem.getWalletClients();
    const funds = 100n;
    const messenger = await hre.viem.deployContract('Messenger');
    return { messenger, funds, owner, otherAccount };
  }

  describe('Post', function () {
    it('Should emit an event on post', async function () {
      const { messenger, otherAccount } = await loadFixture(deployContract);

      expect(
        await messenger.write.post(['text', otherAccount.account.address], {
          value: 1n,
        })
      ).to.emit(messenger, 'NewMessage');
    });

    it('Should send the correct amount of tokens', async function () {
      const { messenger, owner, otherAccount } =
        await loadFixture(deployContract);
      const test_deposit = 10n;

      expect(
        await messenger.write.post(['test', otherAccount.account.address], {
          value: test_deposit,
        })
      ).to.changeEtherBalances(
        [owner.account, otherAccount.account],
        [-test_deposit, test_deposit]
      );
    });

    it('Should set the right Message', async function () {
      const { messenger, owner, otherAccount } =
        await loadFixture(deployContract);
      const test_deposit = 1n;
      const test_text = 'test';

      await messenger.write.post([test_text, otherAccount.account.address], {
        value: test_deposit,
      });
      const messages = await messenger.read.getOwnMessages({
        account: otherAccount.account,
      });
      const message = messages[0];
      expect(message.depositInWei).to.equal(test_deposit);
      expect(message.text).to.equal(test_text);
      console.log('sender', message.sender, owner.account.address);
      expect(message.sender).to.equal(getAddress(owner.account.address));
      expect(message.receiver).to.equal(
        getAddress(otherAccount.account.address)
      );
    });
  });

  describe('Accept', function () {
    it('Should emit an event on accept', async function () {
      const { messenger, otherAccount } = await loadFixture(deployContract);
      const test_deposit = 1n;

      await messenger.write.post(['text', otherAccount.account.address], {
        value: test_deposit,
      });

      const first_index = 0n;
      expect(
        await messenger.write.accept([first_index], {
          account: otherAccount.account,
        })
      ).to.emit(messenger, 'MessageConfirmed');
    });

    it('isPending must be changed', async function () {
      const { messenger, otherAccount } = await loadFixture(deployContract);
      const first_index = 0n;

      await messenger.write.post(['text', otherAccount.account.address]);
      let messages = await messenger.read.getOwnMessages({
        account: otherAccount.account,
      });
      expect(messages[0].isPending).to.equal(true);

      await messenger.write.accept([first_index], {
        account: otherAccount.account,
      });
      messages = await messenger.read.getOwnMessages({
        account: otherAccount.account,
      });
      expect(messages[0].isPending).to.equal(false);
    });

    it('Should send the correct amount of tokens', async function () {
      const { messenger, otherAccount } = await loadFixture(deployContract);
      const test_deposit = 10n;

      await messenger.write.post(['text', otherAccount.account.address], {
        value: test_deposit,
      });

      const first_index = 0n;
      expect(
        await messenger.write.accept([first_index], {
          account: otherAccount.account,
        })
      ).to.changeEtherBalances(
        [messenger, otherAccount.account],
        [-test_deposit, test_deposit]
      );
    });

    it('Should revert with the right error if called in duplicate', async function () {
      const { messenger, owner, otherAccount } =
        await loadFixture(deployContract);
      const test_deposit = 10n;

      await messenger.write.post(['text', otherAccount.account.address], {
        value: test_deposit,
      });

      const first_index = 0n;
      await messenger.write.accept([first_index], {
        account: otherAccount.account,
      });
      await expect(
        messenger.write.accept([first_index], {
          account: otherAccount.account,
        })
      ).to.be.rejectedWith('This message has already been confirmed');
    });
  });

  describe('Deny', function () {
    it('Should emit an event on deny', async function () {
      const { messenger, otherAccount } = await loadFixture(deployContract);
      const test_deposit = 1n;

      await messenger.write.post(['text', otherAccount.account.address], {
        value: test_deposit,
      });

      const first_index = 0n;
      expect(
        await messenger.write.deny([first_index], {
          account: otherAccount.account,
        })
      ).to.emit(messenger, 'MessageConfirmed');
    });

    it('isPending must be changed', async function () {
      const { messenger, otherAccount } = await loadFixture(deployContract);
      const first_index = 0n;

      await messenger.write.post(['text', otherAccount.account.address]);
      let messages = await messenger.read.getOwnMessages({
        account: otherAccount.account,
      });
      expect(messages[0].isPending).to.equal(true);

      await messenger.write.deny([first_index], {
        account: otherAccount.account,
      });
      messages = await messenger.read.getOwnMessages({
        account: otherAccount.account,
      });
      expect(messages[0].isPending).to.equal(false);
    });

    it('Should send the correct amount of tokens', async function () {
      const { messenger, owner, otherAccount } =
        await loadFixture(deployContract);
      const test_deposit = 10n;

      await messenger.write.post(['text', otherAccount.account.address], {
        value: test_deposit,
      });

      const first_index = 0n;
      expect(
        await messenger.write.deny([first_index], {
          account: otherAccount.account,
        })
      ).to.changeEtherBalances(
        [messenger, owner.account],
        [-test_deposit, test_deposit]
      );
    });

    it('Should revert with the right error if called in duplicate', async function () {
      const { messenger, otherAccount } = await loadFixture(deployContract);
      const test_deposit = 10n;
      await messenger.write.post(['text', otherAccount.account.address], {
        value: test_deposit,
      });

      const first_index = 0n;
      await messenger.write.deny([first_index], {
        account: otherAccount.account,
      });
      await expect(
        messenger.write.deny([first_index], {
          account: otherAccount.account,
        })
      ).to.be.rejectedWith('This message has already been confirmed');
    });
  });
});
