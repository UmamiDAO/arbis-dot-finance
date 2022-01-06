import React from 'react'

import DashboardCard from './DashboardCard'
import StArbisEthLPAddress from '../contracts/stARBISETHLP.address.js'

const farmAddress = StArbisEthLPAddress

export default function StArbisEthSushiFarm() {
  return (
    <DashboardCard>
      <DashboardCard.Title>ARBIS/ETH Sushi LP Staking</DashboardCard.Title>

      <DashboardCard.Subtitle>
        <a
          href={`https://arbiscan.io/address/${farmAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 font-normal"
        >
          {farmAddress.slice(0, 8)}...
        </a>
      </DashboardCard.Subtitle>
    </DashboardCard>
  )
}
