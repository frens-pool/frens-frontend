import { useState } from "react";
import {
  useNetwork,
  useAccount,
  useWalletClient,
  useWaitForTransaction,
  usePublicClient,
  Address,
} from "wagmi";
import { parseEther, encodeFunctionData } from "viem";
import { useTokenBalance } from "#/hooks/read/useTokenBalance";
import { etherscanUrl } from "#/utils/externalUrls";
import { useNetworkName } from "#/hooks/useNetworkName";
import { FrensContracts } from "#/utils/contracts";
import { beaconchainUrl, ssvScanValidatorUrl } from "#/utils/externalUrls";
import { useSendSSV } from "#/hooks/write/useSendSSV";
import { usePoolPubKey } from "#/hooks/read/usePoolPubKey";
import { useApprove } from "#/hooks/write/useApprove";

export const SSVRegisterValidator = ({
  payloadData,
  operators,
  poolAddress,
  itemEnabled,
}: {
  payloadData: any;
  operators: any;
  poolAddress: Address;
  itemEnabled?: Boolean;
}) => {

  // debugger;
  const [registerTxHash, setRegisterTxHash] = useState<string | undefined>();
  const network = useNetworkName();
  const { address: walletAddress } = useAccount();
  const { chain } = useNetwork();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { balance: SSVPoolBalance } = useTokenBalance({
    tokenAddress: FrensContracts[network].SSVTokenContract.address,
    accountAddress: poolAddress,
  });

  const { write: approve } = useApprove({ value: SSVPoolBalance ? SSVPoolBalance.toString() : "0", spender: FrensContracts[network].SSVNetworkContract.address });


  const { data: sendSSVdata, write: sendTransaction } = useSendSSV({
    recipient: poolAddress,
    amount: parseEther("10"),
  });

  const { isLoading: sendIsLoading, isSuccess: sendIsSuccess } =
    useWaitForTransaction({
      // @ts-ignore
      hash: sendSSVdata?.hash,
    });

  const registerSSVValidator = async () => {

    const clusterParams = Object.values(payloadData.clusterData.cluster[1]);

    const functionArgs = [payloadData.payload.shares[0].payload.publicKey,
    payloadData.payload.shares[0].payload.operatorIds,
    payloadData.payload.shares[0].payload.sharesData,
    payloadData.tokenAmount,
      clusterParams];

    functionArgs.map((a, i) => { console.log(`ARG${i} : ${(typeof a)} ${a}`) })

    // {
    //   validatorCount: clusterData.validatorCount,
    //   networkFeeIndex: clusterData.networkFeeIndex,
    //   index: clusterData.index,
    //   balance: clusterData.balance,
    //   active: true,
    // };
    // function data to send to the SSV contract
    const encodedFunctionData = encodeFunctionData({
      abi: FrensContracts[network].SSVNetworkContract.abi,
      args: functionArgs,
      functionName: "registerValidator",
    });

    const { request } = await publicClient.simulateContract({
      account: walletAddress,
      address: poolAddress,
      abi: FrensContracts[network].StakingPool.abi,
      args: [encodedFunctionData],
      functionName: "callSSVNetwork",
    });

    if (walletClient) {
      const txHash = await walletClient.writeContract(request);
      setRegisterTxHash(txHash);
    }
  };

  const { isLoading: registerIsLoading, isSuccess: registerIsSuccess } =
    useWaitForTransaction({
      // @ts-ignore
      hash: registerTxHash,
    });

  if (registerIsLoading) {
    return (
      <div className="flex flex-col my-2 p-2 justify-center">
        <div>
          <button
            className="btn bg-gradient-to-r from-frens-blue to-frens-teal loading text-white my-2 mr-2"
            disabled
          >
            Register in progress
          </button>
        </div>
        {registerIsLoading && (
          <div className="mb-2">
            <a
              href={`${etherscanUrl(chain)}/tx/${registerTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link text-frens-main underline px-2"
            >
              tx on Etherscan
            </a>
          </div>
        )}
      </div>
    );
  }
  if (registerIsSuccess) {
    return (
      <div className="w-2/5 mx-auto my-2 p-2">
        <div>✅ successfully registered ✅</div>
        <div className="my-2">
          <div>Check it out here:</div>
          <a
            href={ssvScanValidatorUrl(payloadData.payload.publicKey, chain)}
            className="link text-frens-main underline px-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            ssvscan.io
          </a>
          <a
            href={`${beaconchainUrl(chain)}/validator/${payloadData.payload.publicKey
              }`}
            className="link text-frens-main underline px-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            beaconcha.in
          </a>
        </div>

        <div>
          All done?
          <div>
            <a
              className="link text-frens-main underline px-2"
              href={`/dashboard`}
            >
              checkout dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (sendIsLoading) {
    return (
      <div className="flex my-0 p-2 justify-center">
        <button className="btn btn-primary my-2 mr-2 loading" disabled>
          Tx pending...
        </button>
        <button className="btn btn-primary my-2 mr-2" disabled>
          Register SSV validator
        </button>
      </div>
    );
  }

  // if (sendIsSuccess || SSVPoolBalance > 0) {
  //   return (
  //     <div className="flex flex-col my-2 p-2 justify-center">
  //       <div className="mt-2">
  //         Great. You are now ready to register your SSV validator.
  //       </div>
  //       <div>
  //         <button
  //           className="btn bg-gradient-to-r from-frens-blue to-frens-teal text-white my-2 mr-2"
  //           onClick={() => registerSSVValidator()}
  //         >
  //           Register SSV validator
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      {itemEnabled ? (
        <div className="flex flex-col my-2 p-2 justify-center">
          <div>{/* <SelectedOperators /> */}</div>
          {/* TODO: check balance correct? */}
          Pool SSV Balance : {SSVPoolBalance?.toString()}{" "}
          <div>
            <button
              className="btn bg-gradient-to-r from-frens-blue to-frens-teal text-white my-2 mr-2"
              onClick={() => {
                if (sendTransaction) {
                  sendTransaction();
                }
                // getClusterData(payloadData.payload.shares[0]);
              }}
            >
              Send SSV token to Pool
            </button>
          </div>
          <div>
            <button
              className="btn bg-gradient-to-r from-frens-blue to-frens-teal text-white my-2 mr-2"
              onClick={() => {
                if (approve) {
                  approve();
                }
                // getClusterData(payloadData.payload.shares[0]);
              }}
            >
              Allow spending SSV tokens
            </button>
          </div>
          <div>
            <button
              className="btn bg-gradient-to-r from-frens-blue to-frens-teal text-white my-2 mr-2"
              onClick={() => registerSSVValidator()}
            >
              Register SSV validator
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="font-extrabold mb-5">
            Please complete &apos;Step 4: Split keyshares&apos; to enable this
            step.
          </p>
          <div className="flex flex-col my-2 opacity-25 p-2 justify-center">
            <div>{/* <SelectedOperators /> */}</div>
            {/* TODO: check balance correct? */}
            Pool SSV Balance : {SSVPoolBalance?.toString()}
            <div>
              <button
                className="btn bg-gradient-to-r from-frens-blue to-frens-teal text-white my-2 mr-2"
                onClick={() => {
                  if (sendTransaction) {
                    sendTransaction();
                  }
                  // getClusterData(payloadData.payload.shares[0]);
                }}
              >
                Send SSV token to Pool
              </button>
            </div>
            <div>
              <button
                className="btn bg-gradient-to-r from-frens-blue to-frens-teal text-white my-2 mr-2"
                onClick={() => registerSSVValidator()}
              >
                Register SSV validator
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// async function buildCluster(
//   clusterParams: {
//     contractAddress: string;
//     nodeUrl: string;
//     ownerAddress: string;
//     operatorIds: number[];
//   } | null
// ) {
//   const clusterData = async () => {
//     const response = await fetch("/api/clusterScanner", {
//       method: "POST",
//       body: JSON.stringify(clusterParams),
//     });

//     if (response.status === 451) {
//       // Something went bad
//     } else {
//       return response.json();
//     }
//   };

//   return await clusterData();
// }
