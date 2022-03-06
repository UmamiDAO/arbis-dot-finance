import {FARMS} from "./config";

import NyanStakingPoolAddress from "./contracts/NyanStakingPool.address";
import NyanETHStakingPoolAddress from "./contracts/NyanETHStakingPool.address";
import CarbonStakingPoolAddress from "./contracts/CarbonStakingPool.address";
import CarbonStrategyAddress from "./contracts/CarbonStrategy.address";
import PongStakingPoolAddress from "./contracts/PongStakingPool.address";
import PongStrategyAddress from "./contracts/PongStrategy.address";
import PonzuStakingPoolAddress from "./contracts/PonzuStakingPool.address";
import ApeStakingPoolAddress from "./contracts/ApeStakingPool.address";
import USDCETHStrategyAddress from "./contracts/USDCETHStrategy.address";
import MIMETHStrategyAddress from "./contracts/MIMETHStrategy.address";
import MIMETHStrategy2Address from "./contracts/MIMETHStrategy2.address";
import SPELLETHStrategyAddress from "./contracts/SPELLETHStrategy.address";
import SWPRETHStrategyAddress from "./contracts/SWPRETHStrategy.address";
import ApeStrategyAddress from "./contracts/ApeStrategy.address";
import PEGGStrategyAddress from "./contracts/PEGGStrategy.address";
import PPEGGETHStrategyAddress from "./contracts/PPEGGETHStrategy.address";
import PPEGGUSDCStrategyAddress from "./contracts/PPEGGUSDCStrategy.address";
import NyanETHStrategyAddress from "./contracts/NyanETHStrategy.address";
import StArbisAddress from "./contracts/StArbis.address";
import ARBISETHStrategy2Address from "./contracts/ARBISETHStrategy2.address";
import ARBISETHStrategy3Address from "./contracts/ARBISETHStrategy3.address";
import MagicUSDCStrategyAddress from "./contracts/MagicUSDCStrategy.address";
import SWPRETHStrategy2Address from "./contracts/SWPRETHStrategy2.address";
import DPXStrategyAddress from "./contracts/DPXStrategy.address";
import MaticTOWERUSDCStrategy from "./contracts/MaticTOWERUSDCStrategy.address";
import MaticIVORYUSDCStrategyAddress from "./contracts/MaticIVORYUSDCStrategy.address";
import ARBISETHStrategy4Address from "./contracts/ARBISETHStrategy4.address";
import SWPRETHStrategy3Address from "./contracts/SWPRETHStrategy3.address";
import HONEYETHStrategyAddress from "./contracts/HONEYETHStrategy.address";
import HoneyUSDCStrategyAddress from "./contracts/HoneyUSDCStrategy.address";
import HONEYADOGEStrategyAddress from "./contracts/HONEYADOGEStrategy.address";
import SPELLETHStrategy2Address from "./contracts/SPELLETHStrategy2.address";
import ARBISETHStrategy5Address from "./contracts/ARBISETHStrategy5.address";
import ARBISETHStrategy6Address from "./contracts/ARBISETHStrategy6.address";
import SPELLETHArbisRewardsAddress from "./contracts/SPELLETHArbisRewards.address";
import MIMETHArbisRewardsAddress from "./contracts/MIMETHArbisRewards.address";
import MAGICETHSTRATEGYAddress from "./contracts/MAGICETHStrategy.address";
import MAGICETHSTRATEGYAddress2 from "./contracts/MAGICETHStrategy2.address";
import L2DAOETHSTRATEGYAddress from "./contracts/L2DAOETHStrategy.address";
import GOHMETHSTRATEGYAddress from "./contracts/GOHMETHSTRATEGY.address";


export const sushiFarms = [
    {
      id: FARMS.USDCETH,
      name: "USDC-ETH Strategy",
      address: USDCETHStrategyAddress
    }, {
      id: FARMS.MIMETH2,
      name: "MIM-ETH Strategy2",
      address: MIMETHStrategy2Address,
      specialWarning: "Users Compounding this farm only earn SUSHI and does not earn SPELL. SPELL is recompounded for depositors"
    },
    {
      id: FARMS.SPELLETH,
      name: "SPELL-ETH Strategy",
      address: SPELLETHStrategyAddress
    },
    {
      id: FARMS.GOHMETH,
      name: "gOHM-ETH Strategy",
      address: GOHMETHSTRATEGYAddress
    },
    {
      id: FARMS.MAGICETH,
      name: "MAGIC-ETH Strategy (withdraw only)",
      address: MAGICETHSTRATEGYAddress
    },/* {
      id: FARMS.MAGICETH2,
      name: "MAGIC-ETH Strategy",
      address: MAGICETHSTRATEGYAddress2
    }, */
    {
      id: FARMS.L2DAOETH,
      name: "L2DAO-ETH Strategy",
      address: L2DAOETHSTRATEGYAddress
    }
  
  ]
  