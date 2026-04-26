// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title SOLUNA Cabin Club — Digital Membership Certificate
/// @notice ERC-721 token representing a facility usage membership right.
///         This token confers no financial return or property ownership rights.
///         It is a digital certificate of membership in the SOLUNA Cabin Club.
contract SOLUNACabinClub is ERC721, Ownable {
    using Strings for uint256;

    struct Membership {
        uint256 units;         // 口数
        uint256 nightsPerYear; // 年間宿泊権 (units × 8)
        uint256 mintedAt;      // Unix timestamp
        string  propertyId;    // e.g. "tapkop"
    }

    uint256 private _nextTokenId = 1;
    mapping(uint256 => Membership) public memberships;
    string private _baseMetadataURI;

    event MembershipMinted(
        uint256 indexed tokenId,
        address indexed to,
        uint256 units,
        string propertyId
    );

    constructor(address initialOwner, string memory baseMetadataURI)
        ERC721("SOLUNA Cabin Club", "SCC")
        Ownable(initialOwner)
    {
        _baseMetadataURI = baseMetadataURI;
    }

    /// @notice Mint a membership NFT. Only callable by the contract owner (SOLUNA server).
    function mint(address to, uint256 units, string calldata propertyId)
        external
        onlyOwner
        returns (uint256 tokenId)
    {
        require(units > 0, "units must be > 0");
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        memberships[tokenId] = Membership({
            units: units,
            nightsPerYear: units * 8,
            mintedAt: block.timestamp,
            propertyId: propertyId
        });
        emit MembershipMinted(tokenId, to, units, propertyId);
    }

    /// @notice Transfer a token from custodial wallet to member's own wallet.
    ///         Wrapper around safeTransferFrom for clarity in frontend.
    function claim(uint256 tokenId, address to) external onlyOwner {
        address owner = ownerOf(tokenId);
        _safeTransfer(owner, to, tokenId);
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseMetadataURI, tokenId.toString()));
    }

    function setBaseMetadataURI(string calldata newURI) external onlyOwner {
        _baseMetadataURI = newURI;
    }
}
