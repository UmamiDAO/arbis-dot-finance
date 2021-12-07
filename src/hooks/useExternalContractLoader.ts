import React from 'react';
// import { Interface } from '@ethersproject/abi'
import { Contract } from "@ethersproject/contracts";
import useUserSigner from './useUserSigner';

export default function useExternalContractLoader(address: string | null, abi: any /* any _should_ be temporary */) {
  const [contract, setContract] = React.useState<Contract | null>(null);
  const userSigner = useUserSigner();

  const handleContract = React.useCallback(() => {
    if (userSigner === null || address === null) {
      return;
    }
    
    setContract(new Contract(address, abi, userSigner));
  }, [abi, address, userSigner]);
  
  React.useEffect(() => {
    handleContract();
  }, [handleContract]);

  return contract;
}
