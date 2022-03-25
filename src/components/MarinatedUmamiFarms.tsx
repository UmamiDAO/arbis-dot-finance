import React from 'react'

import UIWrapper from './UIWrapper'
import MarinateAutocompounder from './MarinateAutocompounder'

export default function MarinatedUmamiFarms() {
  const cardWrapperClasses = 'w-full mt-4 mr-4 md:w-1/3'

  return (
    <UIWrapper>
      <div className="flex w-full items-center">
        <div className={cardWrapperClasses}>
          <MarinateAutocompounder />
        </div>
      </div>
    </UIWrapper>
  ) 
}
