import { useStake } from "../../hooks/write/useStake";
import { useNetwork, useWaitForTransaction } from "wagmi";
import { etherscanUrl } from "#/utils/externalUrls";

export const Deposit = ({
  poolAddress
}: {
  poolAddress: string;
}) => {
  const { data, write: stake } = useStake({ poolAddress });
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });
  const { chain } = useNetwork();


  if (isSuccess) {
    <div className="mt-2 mb-4">✅ Deposit successful ✅</div>;
  }

  return (
    <div>
      <button
        className={`${isLoading
          ? "btn btn-info no-animation my-2 mr-2"
          : "btn bg-gradient-to-r from-frens-blue to-frens-teal text-white mb-2"
          }`}
        onClick={() => {
          if (stake) stake();
        }}
        disabled={isLoading}
      >
        {isLoading ? "Deposit in progress..." : "Deposit ETH to Beacon chain"}
      </button>
      {isLoading && (
        <div className="my-2">
          <a
            href={`${etherscanUrl(chain)}/tx/${data?.hash}`}
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
};
