// ========================================
// WALLET CONNECTION - Multi-provider Support
// ========================================

class WalletManager {
    constructor() {
        this.provider = null;
        this.web3 = null;
        this.userAddress = null;
        this.chainId = null;
        this.balance = null;
        this.listeners = {
            connected: [],
            disconnected: [],
            chainChanged: [],
            accountChanged: []
        };
    }

    async connectMetaMask() {
        try {
            if (!window.ethereum) {
                alert('MetaMask not installed. Download it from https://metamask.io');
                return false;
            }
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.provider = window.ethereum;
            this.web3 = new Web3(window.ethereum);
            this.userAddress = accounts[0];
            this.chainId = await this.getChainId();
            console.log('✅ MetaMask connected');
            this.setupEventListeners();
            this.emit('connected', { provider: 'MetaMask', address: this.userAddress });
            return true;
        } catch (error) {
            console.error('MetaMask connection error:', error);
            return false;
        }
    }

    async connectWalletConnect() {
        alert('WalletConnect support coming soon!');
        return false;
    }

    async connectCoinbaseWallet() {
        alert('Coinbase Wallet support coming soon!');
        return false;
    }

    async getChainId() {
        return parseInt(await this.provider.request({ method: 'eth_chainId' }));
    }

    setupEventListeners() {
        if (!this.provider) return;
        this.provider.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                this.disconnect();
            } else {
                this.userAddress = accounts[0];
                this.emit('accountChanged', { address: this.userAddress });
            }
        });
    }

    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    disconnect() {
        this.provider = null;
        this.web3 = null;
        this.userAddress = null;
        this.emit('disconnected', {});
    }

    isConnected() {
        return this.userAddress !== null;
    }

    getAddress() {
        return this.userAddress;
    }

    getChainIdName() {
        const chains = { 1: 'Ethereum Mainnet', 137: 'Polygon', 43114: 'Avalanche' };
        return chains[this.chainId] || `Chain ${this.chainId}`;
    }
}

let walletManager = null;

function initializeWalletUI() {
    walletManager = new WalletManager();
    const metamaskBtn = document.getElementById('metamask');
    if (metamaskBtn) {
        metamaskBtn.addEventListener('click', async () => {
            const connected = await walletManager.connectMetaMask();
            if (connected) updateWalletUI();
        });
    }
    document.getElementById('walletconnect')?.addEventListener('click', () => walletManager.connectWalletConnect());
    document.getElementById('coinbase')?.addEventListener('click', () => walletManager.connectCoinbaseWallet());
    walletManager.on('connected', updateWalletUI);
}

function updateWalletUI() {
    if (!walletManager.isConnected()) return;
    const address = walletManager.getAddress();
    const shortAddress = address.substring(0, 6) + '...' + address.substring(38);
    console.log('Connected:', shortAddress, walletManager.getChainIdName());
}

window.WalletManager = WalletManager;
window.initializeWalletUI = initializeWalletUI;