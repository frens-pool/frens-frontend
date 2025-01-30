import { useState, useEffect } from "react";
import { Address, useEnsName, useNetwork } from "wagmi";
import { queryOperator } from "hooks/graphql/queryOperator";
import { usePoolOwner } from "../../hooks/read/usePoolOwner";
import { PoolStateVisual } from "../shared/PoolStateVisual";
import { ValidatorWidget } from "#/components/staker/ValidatorWidget";
import FeeRecCheckSet from "#/components/dashboard/FeeRecCheckSet";
import PoolSSVBalance from "#/components/dashboard/PoolSSVBalance";
import { etherscanUrl } from "#/utils/externalUrls";

export const OperatorWidget = ({ poolAddress, operatorAddress, poolBalance, poolState, accountPoolOwner }: {
  poolAddress: any;
  operatorAddress: any;
  poolBalance: number;
  poolState: any;
  accountPoolOwner: Boolean;
}) => {
  const [operatorENS, setOperatorENS] = useState("");
  const [operatorImage, setOperatorImage] = useState("");
  const [operatorName, setOperatorName] = useState("");

  const { poolOwner, isSuccess } = usePoolOwner({ poolAddress });
  const { chain } = useNetwork();
  const [showDetails, toggleShowDetails] = useState(false);



  const { data: ensName } = useEnsName({
    address: operatorAddress,
    chainId: chain?.id ?? 5,
    cacheTime: 1_000,
  });



  useEffect(() => {
    if (ensName && operatorAddress) {
      setOperatorENS(ensName.toString());
      fetchOperatorProfile(operatorAddress);
    }
  }, [ensName, operatorAddress]);

  const fetchOperatorProfile = async (operatorAddress: Address) => {
    const operatorProfileFromFetch = await queryOperator({
      operatorAddress: operatorAddress,
    });

    setOperatorImage(
      operatorProfileFromFetch?.data?.defaultProfile?.picture?.original?.url
    );

    setOperatorName(operatorProfileFromFetch?.data?.defaultProfile?.name);
  };

  // if (operatorENS) {
  //   return (
  //     <div className="text-center overflow-hidden rounded-xl border border-gray-200">
  //       <div className="flex justify-center align-middle bg-white rounded-xl p-8 md:p-0 ">
  //         <img
  //           className="w-24 h-24 md:w-48 md:h-auto rounded-full"
  //           src={operatorImage}
  //           alt={operatorENS}
  //           width="384"
  //         />
  //         <div className="py-6 px-8 text-center md:text-left space-y-2">
  //           <blockquote>
  //             <h1 className="text-lg font-medium">Your frenly pool operator</h1>
  //           </blockquote>
  //           <div className="font-medium mb-2">
  //             <div className="text-frens-main">{operatorName}</div>
  //             <div className="text-frens-main">{ensName}</div>
  //           </div>
  //           {/* <button onClick={follow}>Follow on Lens</button> */}
  //           {ensName && (
  //             <a
  //               href={
  //                 "https://lenster.xyz/u/" +
  //                 ensName.replace(new RegExp(".eth$"), ".lens")
  //               }
  //               target="_blank"
  //               rel="noopener noreferrer"
  //               className="py-2"
  //             >
  //               Follow on Lens
  //             </a>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <div className="w-full flex-col items-center justify-center border-b-[1px] border-frens-blue border-dashed">
      <div className="w-full flex flex-col lg:flex-row items-start justify-center px-[8vw] pt-16 lg:pt-24 pb-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-start">
          <div className="flex flex-row items-end justify-start">
            <div className="flex flex-col items-start justify-start">
              <p className="text-[10px] uppercase text-frens-blue">Pool</p>
              <h1 className="text-[34px] font-extrabold"><a className="underline" target="_blank" href={`${etherscanUrl(chain)}/address/${poolAddress}`}>{poolAddress ? `${poolAddress.slice(0, 4)}...${poolAddress.slice(-4)}` : null}</a></h1>
            </div>
            {/* <img
              className="w-5 h-5 mb-3 mx-4"
              src="/copypaste.png"
            /> */}
          </div>
          <div className="text-[14px] mb-4 lg:mb-[8px] lg:ml-3 font-semibold lg:font-normal">Owned by {accountPoolOwner ? "you (" : null}<a className="underline" target="_blank" href={`${etherscanUrl(chain)}/address/${operatorAddress}`}>{operatorENS ? ensName : `${operatorAddress.slice(0, 4)}...${operatorAddress.slice(-4)}`}</a>{accountPoolOwner ? ")" : null}</div>
        </div>
        <div className="w-full flex flex-col-reverse lg:flex-row items-start lg:items-end justify-start pt-2 flex-1">
          <div className="hidden lg:block flex-1 text-frens-blue underline font-semibold text-[14px] mt-10 lg:mt-0 mb-2 lg:mb-0 lg:ml-6" onClick={() => toggleShowDetails(!showDetails)}>{showDetails ? "hide" : "show"} details</div>
          <div className="block lg:hidden btn-smol bg-slate-200 mt-6 mb-2" onClick={() => toggleShowDetails(!showDetails)}>{showDetails ? "hide" : "show"} details</div>
          <div className="w-full lg:w-auto flex flex-row">
            <div className="flex flex-col items-start lg:items-end justify-start mr-12 lg:mr-0 lg:ml-10">
              <p className="text-[10px] uppercase text-frens-blue">Current rewards</p>
              {poolState === 'staked' ?
                <div className="relative group">
                  <h2 className="text-[20px] mt-[5px] font-extrabold text-frens-gradient">
                    {poolBalance.toFixed(4)} ETH
                  </h2>

                  {/* Tooltip */}
                  <span className="absolute left-1/2 -translate-x-1/2 -top-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-400 text-white text-xs font-semibold py-1 px-2 rounded-lg whitespace-nowrap">
                    {poolBalance} ETH
                  </span>
                </div>
                :
                <h2 className="text-[20px] mt-[5px] font-extrabold text-frens-gradient">-</h2>
              }

            </div>
            <div className="flex flex-col items-start lg:items-end justify-start lg:ml-10">
              <p className="text-[10px] uppercase text-frens-blue">Pool status</p>
              <PoolStateVisual poolState={poolState} showDetails={() => toggleShowDetails(!showDetails)} />
            </div>
          </div>
        </div>
      </div>
      {showDetails &&
        <div className="w-full flex flex-col items-start justify-start px-[8vw] pb-10">
          <div className="w-full flex flex-col items-start justify-start border-l-[2px] border-slate-200">
            <ValidatorWidget poolAddress={poolAddress} />
            <PoolSSVBalance poolAddress={poolAddress} />
            <FeeRecCheckSet poolAddress={poolAddress} />
          </div>
        </div>

      }

    </div>
  );
};
