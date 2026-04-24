'use client';
import { useState, useEffect, useCallback } from 'react';
import { Wallet, ChevronDown, ExternalLink, Copy, CheckCheck, AlertCircle, Loader2 } from 'lucide-react';

interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
}

const CHAIN_NAMES: Record<string, string> = {
  '0x1': 'Ethereum',
  '0xaa36a7': 'Sepolia',
  '0x89': 'Polygon',
  '0x38': 'BNB Chain',
};

export function WalletConnect() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null, balance: null, chainId: null,
    isConnecting: false, isConnected: false, error: null
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchBalance = useCallback(async (address: string) => {
    if (!window.ethereum) return;
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const ethBalance = (parseInt(balance, 16) / 1e18).toFixed(4);
      setWallet(prev => ({ ...prev, balance: ethBalance }));
    } catch {
      // ignore
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWallet(prev => ({ ...prev, error: 'MetaMask not found. Please install it.' }));
      return;
    }
    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId: string = await window.ethereum.request({ method: 'eth_chainId' });
      setWallet(prev => ({
        ...prev,
        address: accounts[0],
        chainId,
        isConnecting: false,
        isConnected: true,
      }));
      await fetchBalance(accounts[0]);

      // Mock recent transactions for demo (Etherscan API needs API key in prod)
      setTransactions([
        { hash: '0xabc...123', from: accounts[0], to: '0xCarbon...Registry', value: '0.02', timeStamp: `${Date.now() - 3600000}` },
        { hash: '0xdef...456', from: '0xMint...Contract', to: accounts[0], value: '0.00', timeStamp: `${Date.now() - 7200000}` },
      ]);
    } catch (err: any) {
      setWallet(prev => ({
        ...prev, isConnecting: false,
        error: err.code === 4001 ? 'Connection rejected.' : 'Failed to connect.'
      }));
    }
  };

  const disconnectWallet = () => {
    setWallet({ address: null, balance: null, chainId: null, isConnecting: false, isConnected: false, error: null });
    setTransactions([]);
    setShowDropdown(false);
  };

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnectWallet();
      else {
        setWallet(prev => ({ ...prev, address: accounts[0] }));
        fetchBalance(accounts[0]);
      }
    };
    const handleChainChanged = (chainId: string) => {
      setWallet(prev => ({ ...prev, chainId }));
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [fetchBalance]);

  const shortAddress = wallet.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : null;

  const chainName = wallet.chainId ? (CHAIN_NAMES[wallet.chainId] || `Chain ${parseInt(wallet.chainId, 16)}`) : null;

  return (
    <div style={{ position: 'relative' }}>
      {!wallet.isConnected ? (
        <button
          onClick={connectWallet}
          disabled={wallet.isConnecting}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', borderRadius: '12px',
            background: wallet.isConnecting
              ? 'rgba(45,134,89,0.4)'
              : 'linear-gradient(135deg, #2d8659, #52b788)',
            border: '1px solid rgba(82,183,136,0.3)',
            color: '#fff', fontSize: '14px', fontWeight: '600',
            cursor: wallet.isConnecting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(45,134,89,0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          {wallet.isConnecting
            ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Connecting...</>
            : <><Wallet size={16} /> Connect MetaMask</>
          }
        </button>
      ) : (
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 14px', borderRadius: '12px',
            background: 'rgba(45,134,89,0.15)',
            border: '1px solid rgba(82,183,136,0.4)',
            color: '#52b788', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          {/* Live pulse dot */}
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
            animation: 'pulse 2s infinite',
            display: 'inline-block',
          }} />
          <span>{shortAddress}</span>
          <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '12px' }}>{wallet.balance} ETH</span>
          <ChevronDown size={14} style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
        </button>
      )}

      {/* Error message */}
      {wallet.error && (
        <div style={{
          position: 'absolute', top: '48px', right: 0,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px', padding: '10px 14px', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '8px',
          color: '#f87171', fontSize: '13px', whiteSpace: 'nowrap',
        }}>
          <AlertCircle size={14} /> {wallet.error}
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && wallet.isConnected && (
        <div style={{
          position: 'absolute', top: '52px', right: 0,
          width: '320px', zIndex: 200,
          background: 'rgba(10,20,15,0.95)',
          border: '1px solid rgba(82,183,136,0.2)',
          borderRadius: '16px', padding: '20px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #2d8659, #52b788)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wallet size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '14px' }}>MetaMask</div>
              <div style={{ color: '#10b981', fontSize: '12px' }}>● {chainName}</div>
            </div>
          </div>

          {/* Balance Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(45,134,89,0.2), rgba(82,183,136,0.1))',
            border: '1px solid rgba(82,183,136,0.2)',
            borderRadius: '12px', padding: '14px', marginBottom: '14px',
          }}>
            <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>ETH BALANCE</div>
            <div style={{ color: '#fff', fontSize: '26px', fontWeight: '700' }}>{wallet.balance} ETH</div>
          </div>

          {/* Address */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
            padding: '10px 12px', marginBottom: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>ADDRESS</div>
              <div style={{ color: '#cbd5e1', fontSize: '13px', fontFamily: 'monospace' }}>{shortAddress}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={copyAddress} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52b788' }}>
                {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
              </button>
              <a href={`https://sepolia.etherscan.io/address/${wallet.address}`} target="_blank" rel="noreferrer"
                style={{ color: '#52b788' }}>
                <ExternalLink size={15} />
              </a>
            </div>
          </div>

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <div>
              <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' }}>Recent Transactions</div>
              {transactions.map((tx, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>{tx.hash}</div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>
                      {new Date(parseInt(tx.timeStamp)).toLocaleTimeString()}
                    </div>
                  </div>
                  <span style={{ color: '#52b788', fontSize: '13px', fontWeight: '600' }}>{tx.value} ETH</span>
                </div>
              ))}
            </div>
          )}

          {/* Disconnect */}
          <button
            onClick={disconnectWallet}
            style={{
              width: '100%', marginTop: '14px',
              padding: '10px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Disconnect Wallet
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.05); }
        }
      `}</style>
    </div>
  );
}

// Add ethereum type to window
declare global {
  interface Window {
    ethereum?: any;
  }
}
