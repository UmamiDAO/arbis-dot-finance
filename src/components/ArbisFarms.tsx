import React from 'react'
import { useKeenSlider } from 'keen-slider/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'

import UIWrapper from './UIWrapper'
import StArbisFarm from './StArbisFarm'
import StArbisEthSushiFarm from './StArbisEthSushiFarm'
import CheemsEthOldFarm from './CheemsEthOldFarm'
import CheemsEth2Farm from './CheemsEth2Farm'

export default function ArbisFarms() {
  const [isInitPosition, setInitPosition] = React.useState<boolean>(true)
  const [isLastPosition, setLastPosition] = React.useState<boolean>(false)

  const [sliderRef, slider] = useKeenSlider({
    breakpoints: {
      '(max-width: 768px)': {
        slides: { perView: 1, origin: 'center' },
        vertical: true,
        selector: null,
      },
    },
    slides: { perView: 3, spacing: 10 },
    slideChanged() {
      setInitPosition(!Boolean(slider.current?.track.details.rel))
      setLastPosition(slider.current?.track.details.abs === 1)
    },
  })

  return (
    <UIWrapper>
      <div className="relative">
        {slider ? (
          <div className="hidden absolute left-0 top-2 right-0 lg:flex lg:items-center lg:justify-between lg:mt-4 lg:-mx-10">
            <button
              type="button"
              onClick={() => slider?.current?.prev()}
              disabled={isInitPosition}
              className={isInitPosition ? 'opacity-0 pointer-events-none' : ''}
            >
              <FontAwesomeIcon icon={faCaretLeft} size="4x" />
            </button>
            <button
              type="button"
              onClick={() => slider?.current?.next()}
              disabled={isLastPosition}
              className={isLastPosition ? 'opacity-0 pointer-events-none' : ''}
            >
              <FontAwesomeIcon icon={faCaretRight} size="4x" />
            </button>
          </div>
        ) : null}
        <div ref={sliderRef} className="mt-8 keen-slider">
          <div className="keen-slider__slide">
            <StArbisFarm />
          </div>
          <div className="keen-slider__slide">
            <StArbisEthSushiFarm />
          </div>
          <div className="keen-slider__slide">
            <CheemsEth2Farm />
          </div>
          <div className="keen-slider__slide">
            <CheemsEthOldFarm />
          </div>
        </div>
      </div>
    </UIWrapper>
  )
}
