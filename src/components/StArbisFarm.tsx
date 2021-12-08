import React from 'react';
import { formatEther } from '@ethersproject/units';
import { Formik, Form, Field } from 'formik';
import DashboardCard from './DashboardCard';
import Selector from './Selector';
import useUserAddress from '../hooks/useUserAddress';
import useExternalContractLoader from '../hooks/useExternalContractLoader';
import StArbisAddress2 from '../contracts/StArbis2.address';
import StArbisAbi from '../contracts/StArbis.abi';
import ERC20Abi from '../contracts/ERC20.abi';

const wETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
const Z2O = '0xdb96f8efd6865644993505318cc08ff9c42fb9ac';
const cheems = '0x75a2f30929c539e7d4ee033c9331b89f879c0cf7';
const farmAddress = StArbisAddress2;

export default function StArbisUI() {
  const initState: {
    status: string;
    tokenAddress: null | string;
    tokenBalance: null | string | number;
    tokenSymbol: null | string | number;
    tokenTotalSupply: null | string | number;
    isApproved: boolean;
    name: null | string | number;
    symbol: null | string | number;
    totalDeposits: null | string | number;
    shareBalance: null | string | number;
    availableWETH: null | string | number;
    availableARBIS: null | string | number;
    avaiableZ20: null | string | number;
    avaiableCheems: null | string | number;
  } = {
    status: 'idle',
    tokenAddress: null,
    tokenBalance: null,
    tokenSymbol: null,
    tokenTotalSupply: null,
    isApproved: false,
    name: null,
    symbol: null,
    totalDeposits: null,
    shareBalance: null,
    availableWETH: null,
    availableARBIS: null,
    avaiableZ20: null,
    avaiableCheems: null,
  };
  const [state, dispatch] = React.useReducer(
    (
      state: typeof initState,
      action:
        | { type: 'started'; payload?: null }
        | { type: 'error'; payload?: null }
        | { type: 'tokenAddress'; payload: { tokenAddress: string } }
        | {
            type: 'success';
            payload: {
              tokenAddress: null | string;
              tokenBalance: null | string | number;
              tokenSymbol: null | string | number;
              tokenTotalSupply: null | string | number;
              isApproved: boolean;
              name: null | string | number;
              symbol: null | string | number;
              totalDeposits: null | string | number;
              shareBalance: null | string | number;
              availableWETH: null | string | number;
              availableARBIS: null | string | number;
              avaiableZ20: null | string | number;
              avaiableCheems: null | string | number;
            };
          }
    ) => {
      switch (action.type) {
        case 'started':
          return { ...state, status: 'pending' };
        case 'error':
          return { ...state, status: 'rejected' };
        case 'tokenAddress':
          return { ...state, tokenAddress: action.payload.tokenAddress };
        case 'success':
          return { ...state, status: 'resolved', ...action.payload };
        default:
          throw new Error('unsupported action type given on StArbisFarm reducer');
      }
    },
    initState
  );

  const userAddress = useUserAddress();
  const farmContract = useExternalContractLoader(farmAddress, StArbisAbi);
  const tokenContract = useExternalContractLoader(state.tokenAddress, ERC20Abi);

  const [action, setAction] = React.useState<string>('deposit');

  const setTokenAddress = React.useCallback(async () => {
    if (farmContract === null) {
      return;
    }

    try {
      dispatch({ type: 'started' });
      const tokenAddress = await farmContract.arbisToken();
      dispatch({ type: 'tokenAddress', payload: { tokenAddress } });
    } catch (err) {
      console.log(err);
      dispatch({ type: 'error' });
    }
  }, [farmContract]);

  const populateState = React.useCallback(async () => {
    if (!farmContract || !tokenContract || !userAddress || state.status !== 'pending') {
      return;
    }

    try {
      const [
        tokenAddress,
        rawTokenBalance,
        tokenSymbol,
        tokenTotalSupply,
        approved,
        name,
        symbol,
        rawTotalDeposits,
        rawShareBalance,
        rawAvailableWETH,
        rawAvailableARBIS,
        rawAvailableZ20,
        rawAvailableCheems,
      ] = await Promise.all([
        farmContract.arbisToken(),
        tokenContract.balanceOf(userAddress),
        tokenContract.symbol(),
        tokenContract.totalSupply(),
        tokenContract.allowance(userAddress, farmAddress),
        farmContract.name(),
        farmContract.symbol(),
        farmContract.totalSupply(),
        farmContract.balanceOf(userAddress),
        farmContract.allowance(userAddress, farmAddress),
        farmContract.getAvailableTokenRewards(wETH),
        farmContract.getAvailableTokenRewards(state.tokenAddress),
        farmContract.getAvailableTokenRewards(Z2O),
        farmContract.getAvailableTokenRewards(cheems),
      ]);

      const tokenBalance = parseFloat(formatEther(rawTokenBalance)).toFixed(3);
      const totalDeposits = parseFloat(formatEther(rawTotalDeposits)).toFixed(3);
      const shareBalance = parseFloat(formatEther(rawShareBalance)).toFixed(3);
      const availableWETH = formatEther(rawAvailableWETH);
      const availableARBIS = formatEther(rawAvailableARBIS);
      const avaiableZ20 = formatEther(rawAvailableZ20);
      const avaiableCheems = formatEther(rawAvailableCheems);

      const isApproved = BigInt('0') !== approved;

      dispatch({
        type: 'success',
        payload: {
          tokenAddress,
          tokenBalance,
          tokenSymbol,
          totalDeposits,
          tokenTotalSupply,
          name,
          symbol,
          shareBalance,
          isApproved,
          availableWETH,
          availableARBIS,
          avaiableZ20,
          avaiableCheems,
        },
      });
    } catch (err) {
      console.log(err);
      dispatch({ type: 'error' });
    }
  }, [farmContract, tokenContract, userAddress, state]);

  React.useEffect(() => {
    setTokenAddress();
  }, [setTokenAddress]);

  React.useEffect(() => {
    populateState();
  }, [populateState]);

  return (
    <DashboardCard>
      <DashboardCard.Title>Arbis Staking</DashboardCard.Title>

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

      <DashboardCard.Content>
        <p className="mt-4">
          Stake your ${state.tokenSymbol} for ${state.name} to earn passive ETH generated
          by fees from all around the Arbi's food court automatically!
        </p>

        <div className="mt-8">
          <div className="flex justify-between">
            <strong>TVL:</strong>
            <div className="text-right">
              {state.totalDeposits} ${state.tokenSymbol}
            </div>
          </div>

          <div className="flex justify-between">
            <strong>1 ${state.symbol}:</strong>
            <div className="text-right">1 ${state.tokenSymbol}</div>
          </div>
        </div>

        <div className="mt-4">
          <Selector>
            {['deposit', 'withdraw'].map((option) => (
              <Selector.Item
                key={option}
                text={option}
                onClick={() => setAction(option)}
                selected={option === action}
              />
            ))}
          </Selector>
        </div>

        {action === 'deposit' ? (
          <div className="mt-4">
            <Formik
              initialValues={{ depositAmount: '0' }}
              onSubmit={(values) => console.log(values)}
            >
              {({ isSubmitting, handleSubmit, setFieldValue }) => (
                <Form method="post">
                  <div>
                    <span>MAX: </span>
                    <button
                      type="button"
                      onClick={() => setFieldValue('depositAmount', state.tokenBalance)}
                      className="text-primary"
                    >
                      {state.tokenBalance}
                    </button>
                    <span> ${state.tokenSymbol}</span>
                  </div>

                  <Field
                    name="depositAmount"
                    className="border mt-2 border-gray-300 p-4 rounded w-full"
                    disabled={isSubmitting}
                  />

                  <div className="mt-4">
                    <DashboardCard.Action
                      onClick={state.isApproved ? handleSubmit : () => {}}
                      color="white"
                    >
                      {state.isApproved ? 'stake' : 'approve'}
                    </DashboardCard.Action>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        ) : null}

        {action === 'withdraw' ? (
          <div className="mt-4">
            <Formik
              initialValues={{ withdrawAmount: '0' }}
              onSubmit={(values) => console.log(values)}
            >
              {({ isSubmitting, handleSubmit, setFieldValue }) => (
                <Form method="post">
                  <div>
                    <span>MAX: </span>
                    <button
                      type="button"
                      onClick={() => setFieldValue('withdrawAmount', state.shareBalance)}
                      className="text-primary"
                    >
                      {state.shareBalance}
                    </button>
                    <span> ${state.tokenSymbol}</span>
                  </div>

                  <Field
                    name="withdrawAmount"
                    className="border mt-2 border-gray-300 p-4 rounded w-full"
                    disabled={isSubmitting}
                  />

                  <div className="mt-4">
                    <DashboardCard.Action
                      onClick={state.isApproved ? handleSubmit : () => {}}
                      color="white"
                    >
                      {state.isApproved ? 'withdraw' : 'approve'}
                    </DashboardCard.Action>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        ) : null}

        <div className="mt-4">
          <DashboardCard.Action onClick={() => {}} color="black">
            Collect All
          </DashboardCard.Action>
        </div>
      </DashboardCard.Content>

      <DashboardCard.More>
        <strong>Current Reward(s):</strong>

        <ul>
          <li className="flex justify-between">
            <div>{state.availableARBIS}</div>
            <div>$ARBIS</div>
          </li>
          <li className="flex justify-between">
            <div>{state.availableWETH}</div>
            <div>$WETH</div>
          </li>
          <li className="flex justify-between">
            <div>{state.avaiableCheems}</div>
            <div>$CHEEMS</div>
          </li>
          <li className="flex justify-between">
            <div>{state.avaiableZ20}</div>
            <div>$Z20</div>
          </li>
        </ul>

        <p className="text-sm mt-4">
          There is no rush to collect your rewards, they are reserved for you and will be there when
          you want to collect them. No one else can touch them.
        </p>
      </DashboardCard.More>
    </DashboardCard>
  );
}
