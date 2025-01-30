import { Address, useNetwork } from "wagmi";
import { FrensContracts } from "utils/contracts";
import { useNetworkName } from "#/hooks/useNetworkName";
import { openseaUrl } from "#/utils/externalUrls";
import { etherscanUrl } from "#/utils/externalUrls";

type CardProps = {
  name: string;
  image: any;
  nftID: string;
  poolAddress?: Address;
  owner: Address;
  claimable: string;
};

function CardForNFT({ name, image, nftID, owner, claimable }: CardProps) {
  const { chain } = useNetwork();
  const network = useNetworkName();
  const openSeaLink = openseaUrl(
    FrensContracts[network].FrensPoolShare.address,
    nftID,
    chain
  );

  return (
    <div className="w-full flex flex-col items-start justify-start">
      <a href={openSeaLink} target="_blank" rel="noopener noreferrer">
        <img src={image} className="w-full rounded-[10px]" alt={name} />
      </a>
      <div className="w-full flex flex-row items-center justify-start border-frens-blue border-dashed border-[1px] border-t-0 rounded-b-[10px] -mt-2 pt-7 pb-4 px-6">
        <div className="flex flex-col items-start justify-start w-[50%]">
          <div className="text-frens-blue uppercase text-[10px]">STAKE Owner</div>
          <div><a className="underline" target="_blank" href={`${etherscanUrl(chain)}/address/${owner}`}>{`${owner.slice(0, 4)}...${owner.slice(-4)}`}</a></div>
        </div>
        <div className="flex flex-col items-start justify-start w-[50%]">
          <div className="text-frens-blue uppercase text-[10px]">Stake rewards</div>
          <div>{claimable}</div>
        </div>
      </div>
      {/* <div className="px-2 text-center">
        {poolAddress && (
          <a
            href={`/pool/${poolAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="text-center underline text-frens-main py-1">
              View pool
            </div>
          </a>
        )}
      </div> */}
    </div>
  );
}

export default CardForNFT;
