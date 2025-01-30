import Link from "next/link";
import Image from "next/image";
import { formatEther } from "viem";
import { PoolType } from "#/types/commonTypes";

import { useState, useEffect, ChangeEvent } from "react";
import { useNetwork, Address } from "wagmi";
import {
  ssvValidatorCostByOwnerApi,
  ssvClusterListByOwnerApi,
} from "#/utils/externalUrls";
import moment from "moment";
import { TopUpClusterBalance } from "./TopUpClusterBalance";

interface ClusterInfo {
  id: number;
  balance: bigint;
  operators: number[];
  feePerBlockWei: bigint;
}

interface PoolSSVBalance {
  poolAddress: Address;
}

function PoolSSVBalance({ poolAddress }: PoolSSVBalance) {
  const { chain } = useNetwork();
  const [clusterInfo, setClusterInfo] = useState<ClusterInfo>();
  const [clusterBalance, setClusterBalance] = useState<bigint>(BigInt(0));
  const [runway, setRunway] = useState<bigint>(BigInt(0));

  useEffect(() => {
    if (!chain) return;
    fetchClusterData();
  }, [chain]);

  const fetchClusterData = async () => {
    const clusterListdata = await fetch(
      ssvClusterListByOwnerApi(1, 1, poolAddress, chain)
    );
    const clusterListdataJson = await clusterListdata.json();
    const validatorCost = await fetch(
      ssvValidatorCostByOwnerApi(poolAddress, chain)
    );
    const validatorCostJson = await validatorCost.json();

    if (clusterListdataJson?.clusters[0] && validatorCostJson) {
      const balance = BigInt(clusterListdataJson.clusters[0].balance);
      setClusterBalance(balance);
      const feePerBlockWei = BigInt(validatorCostJson.fees?.per_block?.wei);
      setClusterInfo({
        id: clusterListdataJson.clusters[0].id,
        balance,
        operators: clusterListdataJson.clusters[0].operators,
        feePerBlockWei,
      });

      const r =
        feePerBlockWei === BigInt(0)
          ? BigInt(0)
          : (balance * BigInt(12)) / feePerBlockWei;
      setRunway(r);
    }
  };

  const updateSSVBalance = (addedValue: number) => {
    setClusterBalance(
      (prevBal: bigint) => prevBal + BigInt(addedValue * 1000000000000000000)
    );
  };

  return (
    <div className="w-full flex flex-col items-start justify-start px-6 lg:px-[1.5vw] py-6 border-b-[1px] border-dashed border-slate-300">
      <div className="w-full flex flex-row items-start justify-start">

        <div className="flex flex-col items-start justify-start mr-6">
          <p className="text-[10px] uppercase text-black mb-[4px]">SSV cluster balance</p>
          <div className="font-semibold">
            {formatEther(clusterBalance)} SSV
          </div>
        </div>

        <div className=" flex flex-col items-start justify-start mr-6">
          <p className="text-[10px] uppercase text-black mb-[4px]">SSV cluster runway</p>
          <div className="relative group font-semibold">
            {`${moment
              .duration(runway?.toString(), "seconds")
              .locale("en")
              .humanize()}`}

            {/* Tooltip showing full days */}
            <span className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-200 text-white text-xs font-semibold py-1 px-2 rounded-lg whitespace-nowrap">
              {`${moment.duration(runway?.toString(), "seconds").asDays().toFixed(2)} days`}
            </span>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-1 flex-col items-start justify-start">
        <p className="text-[10px] uppercase text-black mt-6 mb-[4px]">Top up SSV cluster balance</p>
        <TopUpClusterBalance
          poolAddress={poolAddress}
          updateSSVBalance={updateSSVBalance}
        />
      </div>
    </div>
  );
}

export default PoolSSVBalance;
