// frontend/src/app/components/ConnectWallet.tsx
import { useWallet } from './WalletProvider';
import { Wallet } from 'lucide-react';

export const ConnectWallet = () => {
  const { address, balance, connectWallet } = useWallet();

  return (
    <div>
      {address ? (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</p>
            <p className="text-xs text-muted-foreground">{balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}</p>
          </div>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      )}
    </div>
  );
};
