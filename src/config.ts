import NyanStakingPoolAddress from './contracts/NyanStakingPool.address'
import NyanETHStakingPoolAddress from './contracts/NyanETHStakingPool.address'
import CarbonStakingPoolAddress from './contracts/CarbonStakingPool.address'
import PongStakingPoolAddress from './contracts/PongStakingPool.address'
import PonzuStakingPoolAddress from './contracts/PonzuStakingPool.address'
import ApeStakingPoolAddress from './contracts/ApeStakingPool.address'

export const THEMES = {
  light: {
    color: 'var(--color-dark)',
    backgroundColor: 'var(--color-light)',
  },
  dark: {
    color: 'var(--color-light)',
    backgroundColor: 'var(--color-dark)',
  },
}

export const TOKEN_ADDRESSES = {
  umami: "0x1622bF67e6e5747b81866fE0b85178a93C7F86e3",
  arbis: "0x9f20de1fc9b161b34089cbEAE888168B44b03461"
}
export const MIGRATION_CONTRACT_ADDRESS = "0xCCf8f034581219482F307b8b00DfF0AE88bD96D9"//TODO: Add migration contract address here

export const DEFAULT_THEME = THEMES.light

export const THEME_KEY = 'arbis_current_theme'

export const FOOTER_LINKS = [
  {
    text: 'Twitter',
    href: 'https://twitter.com/arbis_finance',
  },
  {
    text: 'Discord',
    href: 'https://discord.gg/VkCZUUKmKN',
  },
  {
    text: 'Github',
    href: 'https://github.com/Arbi-s',
  },/*
  {
    text: 'Analytics',
    href: 'https://curlyfries.xyz',
  },*/
  {
    text: 'Docs',
    href: 'https://arbisfinance.gitbook.io/food-court/',
  },
]

export const NAVIGATION_LINKS = [
  {
    text: 'Dashboard',
    href: '/',
  },
  {
    text: 'Farms',
    href: '/farms',
  },
  {
    text: 'Exchange',
    href: '/exchange'
  }
]

export const FARMS_LINKS = [
  {
    text: 'ARBIS Farms',
    href: '/arbis-farms',
  },/* 
  {
    text: 'NYAN Farms',
    href: '/nyan-farms',
  },
  {
    text: 'Swapr Farms',
    href: '/swapr-farms',
  }, */
  {
    text: 'Sushi Farms',
    href: '/sushi-farms',
  },
  {
    text: 'Legacy Farms',
    href: '/legacy-farms',
  },
]

export const INFURA_ID = '460f40a260564ac4a4f4b3fffb032dad'

export const ETHERSCAN_KEY = 'PSW8C433Q667DVEX5BCRMGNAH9FSGFZ7Q8'

export const NETWORKS = {
  localhost: {
    name: 'localhost',
    color: '#666666',
    chainId: 31337,
    blockExplorer: '',
    rpcUrl: 'http://' + window.location.hostname + ':8545',
  },
  mainnet: {
    name: 'mainnet',
    color: '#ff8b9e',
    chainId: 1,
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_ID}`,
    blockExplorer: 'https://etherscan.io/',
  },
  kovan: {
    name: 'kovan',
    color: '#7003DD',
    chainId: 42,
    rpcUrl: `https://kovan.infura.io/v3/${INFURA_ID}`,
    blockExplorer: 'https://kovan.etherscan.io/',
    faucet: 'https://gitter.im/kovan-testnet/faucet', // https://faucet.kovan.network/
  },
  rinkeby: {
    name: 'rinkeby',
    color: '#e0d068',
    chainId: 4,
    rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_ID}`,
    faucet: 'https://faucet.rinkeby.io/',
    blockExplorer: 'https://rinkeby.etherscan.io/',
  },
  ropsten: {
    name: 'ropsten',
    color: '#F60D09',
    chainId: 3,
    faucet: 'https://faucet.ropsten.be/',
    blockExplorer: 'https://ropsten.etherscan.io/',
    rpcUrl: `https://ropsten.infura.io/v3/${INFURA_ID}`,
  },
  goerli: {
    name: 'goerli',
    color: '#0975F6',
    chainId: 5,
    faucet: 'https://goerli-faucet.slock.it/',
    blockExplorer: 'https://goerli.etherscan.io/',
    rpcUrl: `https://goerli.infura.io/v3/${INFURA_ID}`,
  },
  xdai: {
    name: 'xdai',
    color: '#48a9a6',
    chainId: 100,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: 'https://dai.poa.network',
    faucet: 'https://xdai-faucet.top/',
    blockExplorer: 'https://blockscout.com/poa/xdai/',
  },
  matic: {
    name: 'matic',
    color: '#2bbdf7',
    chainId: 137,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: 'https://rpc-mainnet.maticvigil.com',
    faucet: 'https://faucet.matic.network/',
    blockExplorer: 'https://explorer-mainnet.maticvigil.com//',
  },
  mumbai: {
    name: 'mumbai',
    color: '#92D9FA',
    chainId: 80001,
    price: 1,
    gasPrice: 1000000000,
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    faucet: 'https://faucet.matic.network/',
    blockExplorer: 'https://mumbai-explorer.matic.today/',
  },
  localArbitrum: {
    name: 'localArbitrum',
    color: '#50a0ea',
    chainId: 153869338190755,
    blockExplorer: '',
    rpcUrl: `http://localhost:8547`,
  },
  localArbitrumL1: {
    name: 'localArbitrumL1',
    color: '#50a0ea',
    chainId: 44010,
    blockExplorer: '',
    rpcUrl: `http://localhost:7545`,
  },
  rinkebyArbitrum: {
    name: 'Arbitrum Testnet',
    color: '#50a0ea',
    chainId: 421611,
    blockExplorer: 'https://rinkeby-explorer.arbitrum.io/#/',
    rpcUrl: `https://rinkeby.arbitrum.io/rpc`,
  },
  arbitrum: {
    name: 'Arbitrum',
    color: '#50a0ea',
    chainId: 42161,
    blockExplorer: 'https://explorer.arbitrum.io/#/',
    rpcUrl:
      'https://apis.ankr.com/5b27e1f711684417b9bd26c9e5999f2a/cbdede3b99068ea911a529811788a2b7/arbitrum/full/main',
    gasPrice: 0,
  },
  localOptimismL1: {
    name: 'localOptimismL1',
    color: '#f01a37',
    chainId: 31337,
    blockExplorer: '',
    rpcUrl: 'http://' + window.location.hostname + ':9545',
  },
  localOptimism: {
    name: 'localOptimism',
    color: '#f01a37',
    chainId: 420,
    blockExplorer: '',
    rpcUrl: 'http://' + window.location.hostname + ':8545',
    gasPrice: 0,
  },
  kovanOptimism: {
    name: 'kovanOptimism',
    color: '#f01a37',
    chainId: 69,
    blockExplorer: 'https://kovan-optimistic.etherscan.io/',
    rpcUrl: `https://kovan.optimism.io`,
    gasPrice: 0,
  },
  optimism: {
    name: 'optimism',
    color: '#f01a37',
    chainId: 10,
    blockExplorer: 'https://optimistic.etherscan.io/',
    rpcUrl: `https://mainnet.optimism.io`,
  },
  localAvalanche: {
    name: 'localAvalanche',
    color: '#666666',
    chainId: 43112,
    blockExplorer: '',
    rpcUrl: `http://localhost:9650/ext/bc/C/rpc`,
    gasPrice: 225000000000,
  },
  fujiAvalanche: {
    name: 'fujiAvalanche',
    color: '#666666',
    chainId: 43113,
    blockExplorer: 'https://cchain.explorer.avax-test.network/',
    rpcUrl: `https://api.avax-test.network/ext/bc/C/rpc`,
    gasPrice: 225000000000,
  },
  mainnetAvalanche: {
    name: 'mainnetAvalanche',
    color: '#666666',
    chainId: 43114,
    blockExplorer: 'https://cchain.explorer.avax.network/',
    rpcUrl: `https://api.avax.network/ext/bc/C/rpc`,
    gasPrice: 225000000000,
  },
}


export const FARMS = Object.freeze({
  NYAN: "nyan",
  NYANETH: "nyan/eth (legacy)",
  NYANETH2: "nyan/eth",
  CARBON: "carbon",
  PONG: "pong",
  PONZU: "ponzu",
  APE: "ape",
  USDCETH: "usdc/eth",
  MIMETH2: "mim/eth",
  SPELLETH: "spell/eth",
  SPELLETH2: "spell/eth2",
  MAGICUSDC: "magicusdc",
  AFARMETH: "afarmeth",
  SWPRETH: "swpr/eth(ended)",
  SWPRETH2: "swpr/eth",
  ARBIS_STAKING: "arbis-staking",
  PPEGG: "ppegg",
  PPEGGETH: "ppegg/eth",
  PPEGGUSDC: "ppegg/usdc",
  PONZI: "PONZI Pool 1",
  MIMETH: "mim/eth (Inactive)",
  STARBISOLD: "stARBIS(Inactive)",
  ARBISETH1: "ARBISETH1(Inactive)",
  ARBISETH2: "ARBISETH2(Inactive)",
  ARBISETH3: "ARBIS/ETH (epoch 2)",
  ARBISETH4: "ARBIS/ETH (epoch 3",
  PPEGGFARMS: "Parrot Defi farms",
  DPX: "Dopex",
  IVORYUSDC: "ivory/usdc",
  TOWERUSDC: "tower/usdc",
  HONEYETH: "honey/eth",
  HONEYUSDC: "honey/usdc",
  HONEYADOGE: "honey/adoge",
  SPELLETHRewards: "SPELL/ETH Share Rewards",
  MIMETHRewards: "MIM/ETH Share Rewards",
  GOHMETH: "gohm/eth",
  MAGICETH: "magic/eth(legacy)",
  MAGICETH2: "magic/eth",
  L2DAOETH: "L2dao/eth"
});

export const STAKING_POOL_ADDRESSES = Object.freeze({
  NYAN: NyanStakingPoolAddress,
  NYANETH: NyanETHStakingPoolAddress,
  CARBON: CarbonStakingPoolAddress,
  PONG: PongStakingPoolAddress,
  PONZU: PonzuStakingPoolAddress,
  APE: ApeStakingPoolAddress,
})
