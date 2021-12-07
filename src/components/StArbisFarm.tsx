import React from 'react';
import { formatEther } from '@ethersproject/units';
import { Formik, Form, Field } from 'formik';
import ArbisSpinner from './ArbisSpinner';
import FarmHeading from './FarmHeading';
import FarmAddress from './FarmAddress';
import FarmInteractionCard from './FarmInteractionCard';
import useUserAddress from '../hooks/useUserAddress';
import useExternalContractLoader from '../hooks/useExternalContractLoader';
import StArbisAbi from '../contracts/StArbis.abi';
import ERC20Abi from '../contracts/ERC20.abi';

const wETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
const Z2O = '0xdb96f8efd6865644993505318cc08ff9c42fb9ac';
const cheems = '0x75a2f30929c539e7d4ee033c9331b89f879c0cf7';

type Props = {
  farm: {
    id: string;
    name: string;
    address: string;
    earn: string | null;
    isLP: boolean;
    specialWarning: React.ReactNode | null;
    hideDeposit: boolean;
  };
};

export default function StArbisUI({ farm }: Props) {
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
  const farmContract = useExternalContractLoader(farm.address, StArbisAbi);
  const tokenContract = useExternalContractLoader(state.tokenAddress, ERC20Abi);

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
        tokenContract.allowance(userAddress, farm.address),
        farmContract.name(),
        farmContract.symbol(),
        farmContract.totalSupply(),
        farmContract.balanceOf(userAddress),
        farmContract.allowance(userAddress, farm.address),
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
  }, [farmContract, tokenContract, farm, userAddress, state]);

  React.useEffect(() => {
    setTokenAddress();
  }, [setTokenAddress]);

  React.useEffect(() => {
    populateState();
  }, [populateState]);

  if (['idle', 'pending'].includes(state.status)) {
    return (
      <div className="flex justify-center w-full">
        <ArbisSpinner />
      </div>
    );
  }

  return (
    <div className="mt-12 px-4">
      <FarmHeading text="ARBIS Staking" />

      <FarmAddress address={farm.address} />

      <p className="mt-4">
        Stake your ${state.tokenSymbol} for ${state.name} to earn passive ${farm.earn} generated by
        fees from all around the Arbi's food court automatically!
      </p>

      <div className="mt-4">
        <div>
          <strong>TVL:</strong>
          <span>
            {' '}
            {state.totalDeposits} ${state.tokenSymbol}
          </span>
        </div>
        <div>
          <strong>1 ${state.symbol}</strong>
          <span> == 1 ${state.tokenSymbol}</span>
        </div>
      </div>

      {!farm.isLP ? (
        <ul className="mt-4 list-disc px-8">
          <li>
            10% early withdrawal fee on any withdrawal amount which decays linearly to 0 over 7 days
            since any last deposit
          </li>
          <li>95% of the resulting fee is redistributed to stakers</li>
          <li>5% of the resulting fee goes to the treasury</li>
        </ul>
      ) : null}

      <div className="mt-8">
        <FarmInteractionCard>
          <Formik initialValues={{ depositAmount: '0' }} onSubmit={(values) => console.log(values)}>
            {({ isSubmitting, handleSubmit, setFieldValue }) => (
              <Form method="post">
                <FarmInteractionCard.Heading>Deposit</FarmInteractionCard.Heading>

                <FarmInteractionCard.SubHeading>
                  <span>MAX: </span>
                  <button
                    type="button"
                    onClick={() => setFieldValue('depositAmount', state.tokenBalance)}
                    className="text-primary"
                  >
                    {state.tokenBalance}
                  </button>
                  <span> ${state.tokenSymbol}</span>
                </FarmInteractionCard.SubHeading>

                <Field
                  name="depositAmount"
                  className="border mt-4 border-gray-300 p-2 rounded-md w-full text-sm"
                  disabled={isSubmitting}
                />

                {state.isApproved ? (
                  <FarmInteractionCard.Action onClick={handleSubmit} disabled={false}>
                    Stake
                  </FarmInteractionCard.Action>
                ) : (
                  <FarmInteractionCard.Action onClick={() => {}} disabled={false}>
                    Approve
                  </FarmInteractionCard.Action>
                )}

                <FarmInteractionCard.Footer>
                  Every time you deposit it will reset the 7 day time limit on withdraw fees.
                </FarmInteractionCard.Footer>
              </Form>
            )}
          </Formik>
        </FarmInteractionCard>
      </div>

      <div className="mt-8">
        <FarmInteractionCard>
          <Formik
            initialValues={{ withdrawAmount: '0' }}
            onSubmit={(values) => console.log(values)}
          >
            {({ isSubmitting, handleSubmit, setFieldValue }) => (
              <Form method="post">
                <FarmInteractionCard.Heading>Withdraw</FarmInteractionCard.Heading>

                <FarmInteractionCard.SubHeading>
                  <span>MAX: </span>
                  <button
                    type="button"
                    onClick={() => setFieldValue('withdrawAmount', state.shareBalance)}
                    className="text-primary"
                  >
                    {state.shareBalance}
                  </button>
                  <span> ${state.tokenSymbol}</span>
                </FarmInteractionCard.SubHeading>

                <Field
                  name="withdrawAmount"
                  className="border mt-4 border-gray-300 p-2 rounded-md w-full text-sm"
                  disabled={isSubmitting}
                />

                {state.isApproved ? (
                  <FarmInteractionCard.Action onClick={handleSubmit} disabled={false}>
                    Stake
                  </FarmInteractionCard.Action>
                ) : (
                  <FarmInteractionCard.Action onClick={() => {}} disabled={false}>
                    Withdraw
                  </FarmInteractionCard.Action>
                )}

                {farm.isLP ? (
                  <FarmInteractionCard.Footer>
                    If you deposited in the last 7 days a 10% early withdraw fee will be charged to
                    the amount you are withdrawing.
                  </FarmInteractionCard.Footer>
                ) : null}

                <FarmInteractionCard.Footer>
                  When you withdraw any pending Tokens will be paid out to your address
                  automatically.
                </FarmInteractionCard.Footer>
              </Form>
            )}
          </Formik>
        </FarmInteractionCard>
      </div>

      {!farm.isLP ? (
        <div className="mt-8">
          <FarmInteractionCard>
            <FarmInteractionCard.Heading>Collect Rewards</FarmInteractionCard.Heading>

            <FarmInteractionCard.SubHeading>
              Collect all pending rewards your st[{farm.name}] generated 💸
            </FarmInteractionCard.SubHeading>

            <div className="mt-4">
              <ul>
                <li className="mt-4">Available Arbis: {state.availableARBIS}</li>
                <li className="mt-4">Available wETH: {state.availableWETH}</li>
                <li className="mt-4">Available Cheems: {state.avaiableCheems}</li>
                <li className="mt-4">Available Z20: {state.avaiableZ20}</li>
              </ul>
            </div>

            <div className="mt-4">
              <FarmInteractionCard.Action onClick={() => {}} disabled={false}>
                Collect All
              </FarmInteractionCard.Action>
            </div>

            <FarmInteractionCard.Footer>
              There is no rush to collect your rewards, they are reserved for you and will be there
              when you want to collect them. No one else can touch them.
            </FarmInteractionCard.Footer>
          </FarmInteractionCard>
        </div>
      ) : null}
    </div>
  );
}
