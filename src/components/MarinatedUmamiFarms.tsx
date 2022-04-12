import React from 'react'

import UIWrapper from './UIWrapper'
import MarinateAutocompounder from './MarinateAutocompounder'
import MarinateV2StrategyFarm from './MarinateV2StrategyFarm'

export default function MarinatedUmamiFarms() {
  return (
    <UIWrapper>
      <div className="mt-8 lg:grid lg:grid-cols-2 lg:gap-8">
        <MarinateAutocompounder />
        <div className="mt-8 lg:mt-0">
          <MarinateV2StrategyFarm />
        </div>
      </div>
    </UIWrapper>
  )
}
