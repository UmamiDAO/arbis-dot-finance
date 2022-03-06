import React from 'react'
import { useKeenSlider } from 'keen-slider/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'

import UIWrapper from './UIWrapper'
import {sushiFarms} from '../FarmLists'
import StArbisFarm from './StArbisFarm'
import StArbisEthSushiFarm from './StArbisEthSushiFarm'
import CheemsEthOldFarm from './CheemsEthOldFarm'
import CheemsEth2Farm from './CheemsEth2Farm'
import SushiFarm from "./SushiFarm"
import { setConstantValue } from 'typescript'

export default function SushiFarms() {
  const [isInitPosition, setInitPosition] = React.useState<boolean>(true)
  const [isLastPosition, setLastPosition] = React.useState<boolean>(false)
  const [loaded, setLoaded] = React.useState<boolean>(false)

  const [sliderRef, slider] = useKeenSlider({
    breakpoints: {
      '(max-width: 768px)': {
        slides: { perView: 1, origin: 'center' },
        vertical: true,
        selector: null,
      },
    },
    range: {max: 5},
    slides: { perView: 5, spacing: 10 },
    slideChanged() {
      // @ts-ignore
      setInitPosition(!Boolean(slider.current.track.details.rel))
      if (
        // @ts-ignore
        slider.current.track.details.abs === 1
      ) {
        setLastPosition(true)
      } else {
        setLastPosition(false)
      }
    },
  })


  React.useEffect(() => {
    if (!loaded) {
      setInterval(()=> {
        setLoaded(true);
      }, 1000);
    }
  }, [loaded])
  console.log(`sushi farms count${sushiFarms.length}`);
  return (

     <UIWrapper>
      <div className="relative">
        {slider ? (
          <div
            className="hidden absolute left-0 right-0 lg:flex lg:items-center lg:justify-between lg:mt-4 lg:-mx-8"
            style={{ top: '0.5rem' }}
          >
            <button
              type="button"
              onClick={() => slider?.current?.prev()}
              disabled={isInitPosition}
              className={isInitPosition ? 'opacity-0 pointer-events-none' : ''}
            >
              <FontAwesomeIcon icon={faCaretLeft} size="2x" />
            </button>
            <button
              type="button"
              onClick={() => slider?.current?.next()}
              disabled={isLastPosition}
              className={isLastPosition ? 'opacity-0 pointer-events-none' : ''}
            >
              <FontAwesomeIcon icon={faCaretRight} size="2x" />
            </button>
          </div>
        ) : null}
        <div ref={sliderRef} className="mt-8 keen-slider">
         
        {sushiFarms.map((farm:any, index: any) => {
      console.log(`showing farm ${farm.id}`);
      return  <div className="keen-slider__slide"><SushiFarm farmAddress={loaded ? farm.address : sushiFarms[0].address} farmName={farm.name}/>  </div>
    
    })}
           
          
        </div>
      </div>
    </UIWrapper> 
  )
}
