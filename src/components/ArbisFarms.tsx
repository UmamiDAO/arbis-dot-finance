import React from 'react'

import UIWrapper from './UIWrapper'
import StArbisFarm from './StArbisFarm'
import StArbisEthSushiFarm from './StArbisEthSushiFarm'

// TODO make card for each farm

// import stARBISETHLPAddress from '../contracts/stARBISETHLP.address';
// import CHEEMSETHStrategyAddress from '../contracts/CHEEMSETHStrategy.address';

/* const farms = [
  {
    id: 'st[ARBIS/ETH] SUSHI LP',
    address: stARBISETHLPAddress,
    name: 'ARBIS/ETH Sushi LP',
    earn: 'Z2O',
    isLP: true,
    specialWarning: (
      <>
        You can get this LP token on{' '}
        <a href="https://app.sushi.com/add/ETH/0x9f20de1fc9b161b34089cbEAE888168B44b03461">Sushi</a>
      </>
    ),
    hideDeposit: false,
  },
  {
    id: 'CHEEMS/ETH (old)',
    name: 'CHEEMS/ETH (old)',
    address: CHEEMSETHStrategyAddress,
    earn: null,
    // zapper is not working zapperAddress: ARBISETHSwaprZapperAddress
    specialWarning: <>This pool is no longer compounding please move to the new one</>,
    isLP: false,
    hideDeposit: false,
  },
  {
    id: 'CHEEMS/ETH 2',
    name: 'CHEEMS/ETH 2',
    address: '0xc5d444bB53DA60574Dd272Ebab609Efa6a483c57',
    earn: null,
    // zapper is not working zapperAddress: ARBISETHSwaprZapperAddress
    isLP: false,
    specialWarning: null,
    hideDeposit: false,
  },
]; */

export default function ArbisFarms() {
  return (
    <UIWrapper>
      <div className="mt-4 max-w-3xl">
        <ul className="list-disc p-4 text-sm ml-4">
          <li>
            10% early withdrawal fee on any withdrawal amount which decays
            linearly to 0 over 7 days since any last deposit
          </li>
          <li className="mt-2">
            95% of the resulting fee is redistributed to stakers
          </li>
          <li className="mt-2">5% of the resulting fee goes to the treasury</li>
        </ul>
        <p className="text-sm mt-4">
          There is no rush to collect your rewards, they are reserved for you
          and will be there when you want to collect them. No one else can touch
          them.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap">
        <StArbisFarm />
        <StArbisEthSushiFarm />
      </div>
    </UIWrapper>
  )
}
