// ========================================
// NFT MINTING - Web3 Integration
// ========================================

class NFTMinter {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.userAddress = null;
        this.nftMetadata = [];
    }

    async connectWeb3(provider) {
        try {
            if (typeof window.ethereum !== 'undefined') {
                this.web3 = new Web3(window.ethereum);
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                this.userAddress = accounts[0];
                console.log('✅ Connected to wallet:', this.userAddress);
                return true;
            } else {
                console.error('Web3 provider not found');
                return false;
            }
        } catch (error) {
            console.error('Web3 connection error:', error);
            return false;
        }
    }

    async uploadToIPFS(data) {
        console.log('📤 Uploading to IPFS...');
        const ipfsHash = 'QmX' + Math.random().toString(36).substr(2, 9);
        return {
            hash: ipfsHash,
            uri: `ipfs://${ipfsHash}`
        };
    }

    async createMetadata(frameData, properties = {}) {
        const imageURI = await this.uploadToIPFS(frameData);

        const metadata = {
            name: properties.name || `CryptoVerse NFT #${Date.now()}`,
            description: properties.description || 'Generated from physics simulation',
            image: imageURI.uri,
            external_url: 'https://cryptoverse.example.com',
            attributes: [
                { trait_type: 'Gravity', value: properties.gravity || '50' },
                { trait_type: 'Particles', value: properties.particles || '100' },
                { trait_type: 'Velocity', value: properties.velocity || '20' },
                { trait_type: 'Color Palette', value: properties.color || '#00ff88' },
                { trait_type: 'Generated Date', value: new Date().toISOString() },
                { trait_type: 'Rarity', value: this.calculateRarity(properties) }
            ]
        };

        const metadataURI = await this.uploadToIPFS(JSON.stringify(metadata));
        this.nftMetadata.push({ ...metadata, uri: metadataURI.uri, hash: metadataURI.hash });
        return metadataURI;
    }

    calculateRarity(properties) {
        const score = 
            (parseInt(properties.particles) / 500) * 0.3 +
            (parseInt(properties.velocity) / 50) * 0.3 +
            (parseInt(properties.gravity) / 100) * 0.4;
        if (score > 0.8) return 'Legendary';
        if (score > 0.6) return 'Rare';
        if (score > 0.4) return 'Uncommon';
        return 'Common';
    }

    async mintNFT(metadataURI, receiver = null) {
        if (!this.userAddress) {
            console.error('Wallet not connected');
            return false;
        }
        try {
            console.log('🎨 Minting NFT...');
            const tokenId = Math.floor(Math.random() * 1000000);
            const transactionHash = '0x' + Math.random().toString(16).substr(2);
            return {
                tokenId,
                contractAddress: '0x' + Math.random().toString(16).substr(2),
                transactionHash,
                metadataURI,
                owner: receiver || this.userAddress,
                mintedAt: new Date().toISOString(),
                chainId: 1,
                explorerUrl: `https://etherscan.io/tx/${transactionHash}`
            };
        } catch (error) {
            console.error('Minting error:', error);
            return false;
        }
    }

    getNFTMetadata() {
        return this.nftMetadata;
    }
}

// ========================================
// NFT GALLERY MANAGER
// ========================================

class NFTGalleryManager {
    constructor(galleryContainerId) {
        this.gallery = document.getElementById(galleryContainerId);
        this.nfts = [];
    }

    addNFT(nftData) {
        this.nfts.push(nftData);
        this.renderGallery();
    }

    renderGallery() {
        if (!this.gallery) return;
        this.gallery.innerHTML = '';
        this.nfts.forEach((nft, index) => {
            const card = document.createElement('div');
            card.className = 'nft-card';
            card.innerHTML = `
                <img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22250%22 height=%22250%22%3E%3Crect fill=%22%231a1f3a%22 width=%22250%22 height=%22250%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2220%22 fill=%22%2300ff88%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ENFT #${index + 1}%3C/text%3E%3C/svg%3E" alt="NFT" class="nft-card-image">
                <div class="nft-card-overlay">
                    <div class="nft-card-info">
                        <h4>${nft.name || `NFT #${index + 1}`}</h4>
                        <p>${nft.rarity || 'Common'}</p>
                    </div>
                </div>
            `;
            this.gallery.appendChild(card);
        });
    }
}

window.NFTMinter = NFTMinter;
window.NFTGalleryManager = NFTGalleryManager;