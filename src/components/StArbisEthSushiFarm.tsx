import React from 'react'
import { formatEther, parseEther } from '@ethersproject/units'
import { Formik, Form, Field } from 'formik'

import DashboardCard from './DashboardCard'
import Selector from './Selector'
import useUserAddress from '../hooks/useUserAddress'
import useUserSigner from '../hooks/useUserSigner'
import useExternalContractLoader from '../hooks/useExternalContractLoader'
import useTransaction from '../hooks/useTransaction'
import StArbisEthLPAddress from '../contracts/stARBISETHLP.address.js'
import ERC20Abi from '../contracts/ERC20.abi'

const wETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const Z2O = '0xdb96f8efd6865644993505318cc08ff9c42fb9ac'
const cheems = '0x75a2f30929c539e7d4ee033c9331b89f879c0cf7'

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
