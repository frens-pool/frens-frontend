import { FrensContracts } from "utils/contracts";
import { Address, useAccount, usePublicClient } from "wagmi";
import { useNetworkName } from "../useNetworkName";
import { useEffect, useState } from "react";

export type nftType = {
  name: string;
  image: string;
  nftID: string;
  poolAddress: Address;
  deposit: number;
  claimable: number;
  owner: Address;
};

export function useUserNfts() {
  const { address: accountAddress, isConnected } = useAccount();
  const [userNFTs, setUserNFTs] = useState<nftType[]>([]);
  const [totalDeposit, setTotalDeposit] = useState<number>(0);
  const [totalClaimable, setTotalClaimable] = useState<number>(0);
  const network = useNetworkName();
  const publicClient = usePublicClient();

  useEffect(() => {
    if (isConnected && accountAddress) {
      getUserNfts(accountAddress);
    }
  }, [isConnected, accountAddress]);

  const getUserNfts = async (accountAddress: Address) => {
    const userNftIDs = await getUserNftIds(accountAddress);
    setUserNFTArray(userNftIDs);
  };

  const getUserNftIds = async (ownerAddress: Address) => {
    const ownerBalance = Number(await readOwnerBalance(ownerAddress));
    const indexes = Array(ownerBalance).fill(0); // create an array of indexes from 0 to ownerBalance
    return await Promise.all(
      indexes.map(
        (_, i) => readTokenOfOwnerByIndex(ownerAddress, i) as Promise<string>
      )
    );
  };

  const readOwnerBalance = (ownerAddress: Address) =>
    publicClient.readContract({
      address: FrensContracts[network].FrensPoolShare.address,
      abi: FrensContracts[network].FrensPoolShare.abi,
      functionName: "balanceOf",
      args: [ownerAddress],
    });

  const readTokenOfOwnerByIndex = (ownerAddress: Address, index: number) =>
    publicClient.readContract({
      address: FrensContracts[network].FrensPoolShare.address,
      abi: FrensContracts[network].FrensPoolShare.abi,
      functionName: "tokenOfOwnerByIndex",
      args: [ownerAddress, index],
    });

  const setUserNFTArray = async (userNftIDs: string[]) => {
    const userWalletNFTs = await Promise.all(
      userNftIDs.map(async (nftID) => await jsonForNftId(nftID))
    );
    if (userWalletNFTs) {
      setTotalDeposit(
        userWalletNFTs.reduce((total, n) => total + n.deposit, 0)
      );
      setTotalClaimable(
        userWalletNFTs.reduce((total, n) => total + n.claimable, 0)
      );
      setUserNFTs(userWalletNFTs);
    }
  };

  const readTokenURI = (nftID: string) =>
    publicClient.readContract({
      address: FrensContracts[network].FrensPoolShare.address,
      abi: FrensContracts[network].FrensPoolShare.abi,
      functionName: "tokenURI",
      args: [nftID],
    });

  const jsonForNftId = async (nftID: string): Promise<nftType> => {
    const tokenURI = (await readTokenURI(nftID)) as string;
    const jsonString = Buffer.from(tokenURI.substring(29), "base64").toString();
    const json = JSON.parse(jsonString);
    return {
      nftID,
      name: json.name,
      image: json.image,
      poolAddress: getAttributeValue(json, "pool"),
      deposit: parseFloat(
        getAttributeValue(json, "deposit").replace(" Eth", "")
      ),
      claimable: parseFloat(
        getAttributeValue(json, "claimable").replace(" Eth", "")
      ),
      owner: accountAddress as Address
    };
  };

  const getAttributeValue = (json: any, name: string) => {
    if (!json.attributes) return null;
    const v = json.attributes.find((a: any) => {
      return a.trait_type === name;
    });
    return v?.value;
  };

  return { userNFTs, totalDeposit, totalClaimable }
}
