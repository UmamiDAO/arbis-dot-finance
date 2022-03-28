import React from 'react'

import UIWrapper from './UIWrapper'
import MarinateAutocompounder from './MarinateAutocompounder'
import MarinateV2StrategyFarm from './MarinateV2StrategyFarm'

export default function MarinatedUmamiFarms() {
  const cardWrapperClasses = 'w-full mt-4 mr-4 md:w-1/3'

  return (
    <UIWrapper>
      <div className="flex flex-col md:flex-row mt-4 w-full">
        <div className={cardWrapperClasses}>
          <MarinateAutocompounder />
        </div>
        <div className={cardWrapperClasses}>
          <MarinateV2StrategyFarm />
        </div>
      </div>
    </UIWrapper>
  )
}
