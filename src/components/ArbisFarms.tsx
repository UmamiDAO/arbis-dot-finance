import React from 'react';
import UIWrapper from './UIWrapper';
import FarmSelector from './FarmSelector';
import StArbisFarm from './StArbisFarm';
import StArbisAddress2 from '../contracts/StArbis2.address';
import stARBISETHLPAddress from '../contracts/stARBISETHLP.address';
import CHEEMSETHStrategyAddress from '../contracts/CHEEMSETHStrategy.address';

const farms = [
  {
    id: 'stARBIS',
    address: StArbisAddress2,
    name: 'ARBIS',
    earn: 'ETH',
    isLP: false,
    specialWarning: null,
    hideDeposit: false,
  },

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
];

type Farm = typeof farms[0];

export default function ArbisFarms() {
  const [currentFarm, setCurrentFarm] = React.useState<Farm>(farms[0]);

  return (
    <UIWrapper>
      <main className="max-w-3xl m-auto w-full">
        <FarmSelector>
          {farms.map((farm) => (
            <FarmSelector.Item
              key={farm.id}
              text={farm.id}
              onClick={() => setCurrentFarm(farm)}
              selected={currentFarm.id === farm.id}
            />
          ))}
        </FarmSelector>
        <div className="max-w-lg w-full m-auto">
          {currentFarm.id === 'stARBIS' ? <StArbisFarm farm={currentFarm} /> : null}
        </div>
      </main>
    </UIWrapper>
  );
}
