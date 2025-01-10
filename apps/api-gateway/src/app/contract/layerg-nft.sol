// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';

contract LayerGNft is OwnableUpgradeable {
    using ECDSA for bytes32;

    // The Domain structure defines the properties
    // of the domain that needs to be validated
    struct Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
        bytes32 salt;
    }

    struct TransferNFT {
        address from;
        address to;
        string nftId;
        uint32 amount;
    }

    struct MintNFT {
        address recipient;
        string nftId;
        uint32 amount;
    }

    string private constant EIP712_DOMAIN_NAME = 'LayerGNft';
    string private constant EIP712_DOMAIN_VERSION = '1';

    // This is the type hash of the EIP712 domain structure
    bytes32 private constant EIP712_DOMAIN_TYPE_HASH =
        keccak256(
            'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)'
        );

    // This is the type hash for transferNFT
    bytes32 private constant TRANSFER_NFT_HASH =
        keccak256(
            'TransferNFT(address from,address to,string nftId,uint32 amount)'
        );

    // This is the type hash for mintNFT
    bytes32 private constant MINT_NFT_HASH =
        keccak256('MintNFT(address to,string nftId,uint32 amount)');

    function hashDomain(Domain memory domain) private pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    EIP712_DOMAIN_TYPE_HASH,
                    keccak256(bytes(domain.name)),
                    keccak256(bytes(domain.version)),
                    domain.chainId,
                    domain.verifyingContract,
                    domain.salt
                )
            );
    }

    function hashTransferNFT(
        TransferNFT memory transferNft
    ) private pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    TRANSFER_NFT_HASH,
                    transferNft.from,
                    transferNft.to,
                    keccak256(bytes(transferNft.nftId)),
                    transferNft.amount
                )
            );
    }

    function hashMintNFT(
        MintNFT memory mintNft
    ) private pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    MINT_NFT_HASH,
                    mintNft.recipient,
                    keccak256(bytes(mintNft.nftId)),
                    mintNft.amount
                )
            );
    }

    // verify for minting NFT
    function mintNFTVerify(
        address recipient,
        string memory nftId,
        uint32 amount,
        bytes32 salt,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 mintNFTHash = hashMintNFT(MintNFT(recipient, nftId, amount));

        verifySignature(mintNFTHash, salt, signature);

        return true;
    }

    // verify for transfering NFT
    function transferNFTVerify(
        address from,
        address to,
        string memory nftId,
        uint32 amount,
        bytes32 salt,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 transferNFTHash = hashTransferNFT(
            TransferNFT(from, to, nftId, amount)
        );

        verifySignature(transferNFTHash, salt, signature);

        return true;
    }

    /**
     * Verify the EIP 712 signature
     * @param messageHash The message hash for EIP 712 structure
     * @param salt The salt for the EIP 712 Domain
     * @param signature The signature to be verified
     */
    function verifySignature(
        bytes32 messageHash,
        bytes32 salt,
        bytes memory signature
    ) private view {
        uint256 chainId = block.chainid;
        address verifyingContract = address(this);
        bytes32 domainHash = hashDomain(
            Domain({
                name: EIP712_DOMAIN_NAME,
                version: EIP712_DOMAIN_VERSION,
                chainId: chainId,
                verifyingContract: verifyingContract,
                salt: salt
            })
        );

        // Calculate the hash according to the given domain and message hash
        bytes32 digest = keccak256(
            abi.encodePacked('\x19\x01', domainHash, messageHash)
        );

        // Use ECDSA to recover the address from the signature
        // and compare it with the owner
        require(digest.recover(signature) == owner(), 'Invalid signature');
    }
}
