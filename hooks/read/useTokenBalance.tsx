import { Address,  useContractRead } from 'wagmi';
import { BigNumber } from 'ethers';

// ERC-20 Token Standard ABI with only the necessary function to check balance
const erc20ABI = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

interface UseTokenBalanceProps {
    tokenAddress: Address;
    accountAddress: Address;
}

export function useTokenBalance({ tokenAddress, accountAddress }: UseTokenBalanceProps) {

    if (!tokenAddress || !accountAddress){
        return { balance: null, isError: false, isLoading: false}
    }

    const { data, isError, isLoading } = useContractRead({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [accountAddress],
        watch: true
    });

    return {
        balance: data as BigNumber,  // Assuming token has 18 decimal places
        isError,
        isLoading
    };
}
