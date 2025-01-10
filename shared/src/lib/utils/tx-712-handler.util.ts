import { ethers } from 'ethers';
import { MintNftOffchainDto, TransferNftOffchainDto } from '../dto';

export class Tx712Handler {
  async hashMintNft(data: MintNftOffchainDto): Promise<string> {
    const domain = {
      name: 'LayerGNft',
      version: '1',
      chainId: 1,
      verifyingContract: '0xe2899bddFD890e320e643044c6b95B9B0b84157A',
    };

    const types = {
      MintNFTOffchain: [
        { name: 'recipient', type: 'address' },
        { name: 'nftId', type: 'string' },
        { name: 'amount', type: 'uint32' },
      ],
    };

    // Hash the data
    const hashMsg = ethers.TypedDataEncoder.hash(domain, types, data);

    // Sign the data
    // const provider = new ethers.BrowserProvider(window.ethereum);
    // const signer = await provider.getSigner();
    // const signature = await signer.signTypedData(domain, types, data);

    return hashMsg;
  }

  async hashTransferNft(data: TransferNftOffchainDto): Promise<string> {
    const domain = {
      name: 'LayerGNft',
      version: '1',
      chainId: 1,
      verifyingContract: '0xe2899bddFD890e320e643044c6b95B9B0b84157A',
    };

    const types = {
      TransferNFT: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'nftId', type: 'string' },
        { name: 'amount', type: 'uint32' },
      ],
    };

    // Hash the data
    const hashMsg = ethers.TypedDataEncoder.hash(domain, types, data);

    // Sign the data
    // const provider = new ethers.BrowserProvider(window.ethereum);
    // const signer = await provider.getSigner();
    // const signature = await signer.signTypedData(domain, types, data);

    return hashMsg;
  }

  async verifySignature(dataHash: string, signature: string): Promise<string> {
    return ethers.recoverAddress(dataHash, signature);
  }
}
