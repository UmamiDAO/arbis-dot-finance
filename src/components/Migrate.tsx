import React from 'react'
import { Link } from 'react-router-dom'
import { Formik, Form } from 'formik'
import { FaExternalLinkAlt, FaChevronCircleDown } from 'react-icons/fa'

import { formatEther, formatUnits, parseEther } from '@ethersproject/units'
import Pill from '../components/Pill'
import FormCard from '../components/FormCard'
import Button from '../components/Button'
import { MIGRATION_CONTRACT_ADDRESS, TOKEN_ADDRESSES } from '../config'
import useUserAddress from '../hooks/useUserAddress'
import useUserSigner from '../hooks/useUserSigner'
import useExternalContractLoader from '../hooks/useExternalContractLoader'
import ERC20Abi from '../contracts/ERC20.abi'
import ARBISUMAMIExchangeAbi from '../contracts/ARBISUMAMIExchange.abi'
import useTransaction, { notify } from '../hooks/useTransaction'
import { BigNumber } from 'ethers'

export default function Migrate() {
  const arbisToUmami = 454545.4545454545

  const initState: {
    status: string
    arbisBalance: null | string | number
    umamiBalance: null | string | number
    approved: null | string | number
    tokenTotalSupply: null | string | number
    isApproved: boolean
    isMigrationOpen: boolean
  } = {
    status: 'idle',
    arbisBalance: 0,
    umamiBalance: 0,
    approved: 0,
    tokenTotalSupply: 0,
    isApproved: false,
    isMigrationOpen: false
  }
  const [state, dispatch] = React.useReducer(
    (
      state: typeof initState,
      action:
        | { type: 'started'; payload?: null }
        | { type: 'error'; payload?: null }
        | { type: 'tokenAddress'; payload: { tokenAddress: string } }
        | {
          type: 'success'
          payload: {
            arbisBalance: null | string | number
            umamiBalance: null | string | number
            approved: null | string | number
            tokenTotalSupply: null | string | number
            isApproved: boolean
            isMigrationOpen: boolean
          }
        }
    ) => {
      switch (action.type) {
        case 'started':
          return { ...state, status: 'pending' }
        case 'error':
          return { ...state, status: 'rejected' }
        case 'tokenAddress':
          return { ...state, tokenAddress: action.payload.tokenAddress }
        case 'success':
          return { ...state, status: 'resolved', ...action.payload }
        default:
          throw new Error(
            'unsupported action type given on StArbisFarm reducer'
          )
      }
    },
    initState
  )



  const userAddress = useUserAddress()
  const userSigner = useUserSigner()
  const arbisContract = useExternalContractLoader(TOKEN_ADDRESSES.arbis, ERC20Abi)
  const umamiContract = useExternalContractLoader(TOKEN_ADDRESSES.umami, ERC20Abi)
  const migrationContract = useExternalContractLoader(MIGRATION_CONTRACT_ADDRESS, ARBISUMAMIExchangeAbi)
  const transaction = useTransaction()

  const populateState = React.useCallback(async () => {
    if (!arbisContract || !umamiContract || !migrationContract || !userAddress) {
      return
    }

    try {
      const [
        rawArbisBalance,
        rawUmamiBalance,
        approved,
        tokenTotalSupply,

      ] = await Promise.all([
        arbisContract.balanceOf(userAddress),
        umamiContract.balanceOf(userAddress),
        arbisContract.allowance(userAddress, MIGRATION_CONTRACT_ADDRESS),
        arbisContract.totalSupply(),
      ])
      const arbisBalance = parseFloat(formatEther(rawArbisBalance))
      const umamiBalance = parseFloat(formatUnits(rawUmamiBalance, 9))

      console.log(`got arbis balance ${rawArbisBalance}, ${rawUmamiBalance}, ${approved}`)
      let isApproved = false
      if (approved) {
        if (!BigNumber.from('0').eq(approved)) {
          if (arbisBalance) {
            if (BigNumber.from(rawArbisBalance).lte(approved)) {
              isApproved = true
            }
          }
        }
      }

      dispatch({
        type: 'success',
        payload: {
          arbisBalance,
          umamiBalance,
          approved,
          tokenTotalSupply,
          isApproved,
          isMigrationOpen: true
        },
      })
    } catch (err) {
      console.log({
        err,
        callingFunc: 'populateState',
        callingFarmName: 'Exchange page',
      })
      dispatch({ type: 'error' })
    }
  }, [arbisContract, umamiContract, migrationContract, userAddress, state])


  const initialize = React.useCallback(() => {
    if (state.status === 'idle') {
      populateState()
    }
    if (state.status === 'pending') {
      populateState()
    }
  }, [populateState, state])


  React.useEffect(() => {
    initialize()
  }, [initialize])


  React.useEffect(() => {
    if (state.status !== 'resolved') {
      return
    }
    const interval = setInterval(populateState, 30000)

    return () => clearInterval(interval)
  }, [state.status, populateState])

  const handleMigrate = React.useCallback(
    async (signer: any, contract: any, amount: number | string) => {

      console.log(`signer ${userSigner}, ${contract} arbis contract ${amount}`)
      if (
        !signer ||
        !contract
      ) {
        return
      }
      console.log(`trying`)
      try {
        const data = await contract.interface.encodeFunctionData('exchange', [
          parseEther(String(Number(amount))),
        ])

        await transaction(
          signer.sendTransaction({ to: MIGRATION_CONTRACT_ADDRESS, data } as any)
        )
      } catch (err) {
        notify.notification({
          eventCode: 'txError',
          type: 'error',
          message: (err as Error).message,
          autoDismiss: 10000,
        })
      }
    }, []
  )

  const approveArbis = React.useCallback(
    async (signer: any, contract: any, amount: any) => {
      console.log(`signer ${signer}, ${contract} arbis contract ${amount}`)
      if (
        !signer ||
        !contract
      ) {
        return
      }
      console.log(`trying ${state}`)
      console.log(state)
      try {
        const data = await contract.interface.encodeFunctionData('approve', [
          MIGRATION_CONTRACT_ADDRESS,
          parseEther(String(amount)),
        ])

        await transaction(
          signer.sendTransaction({ to: TOKEN_ADDRESSES.arbis, data } as any)
        )
        setInterval(()=>{window.location.reload()}, 30000);
       
      } catch (err) {
        notify.notification({
          eventCode: 'txError',
          type: 'error',
          message: (err as Error).message,
          autoDismiss: 10000,
        })
      }
    }, []
  )

  const calcTokensFromShares = React.useCallback(
    (amount: number | string) => {
      return Number(amount) * Number(arbisToUmami)
    },
    [arbisToUmami]
  )

  const calcConvertedToken = React.useCallback(
    (amount: number | string) => {
      if (!amount || !arbisToUmami) {
        return 0
      }

      return Number(amount) / Number(arbisToUmami)
    },
    [arbisToUmami, calcTokensFromShares]
  )


  const arbisToUmamiPill = React.useMemo(() => {
    return arbisToUmami ? (
      <Pill className="mt-8 text-xl m-auto uppercase text-white">
        1 UMAMI : {Number(arbisToUmami).toFixed(3)} ARBBIS
      </Pill>
    ) : null
  }, [arbisToUmami])

  return (
    <main>
      <header className="text-center w-full mt-8 p-4">
        <h1 className="font-bold text-5xl tracking-widest uppercase md:text-6xl">
          Exchange
        </h1>
        <p className="max-w-xs m-auto mt-8">
          <span>Exchange</span>
          <strong> ARBIS </strong>
          <span>for</span>
          <strong> UMAMI </strong>
          <span>to earn maximum passive income potential.</span>
        </p>
      </header>

      <div className="max-w-6xl px-4 m-auto text-center lg:grid lg:grid-cols-3 lg:gap-4" style={{ display: "flex" }}>

        {arbisToUmamiPill}
      </div>

      <section>
        <div className=" mt-8 py-8 w-full">
          <div className="m-auto max-w-6xl px-4 w-full">


            <div className="mt-4 md:grid md:grid-cols-2 md:gap-4">
              <div className="leading-loose md:pr-4">
                <p>
                  ARBIS token is being rolled in to UMAMI. In order to continue earning passive yield migrate to UMAMI.
                </p>

                <a
                  href="https://umamifinance.medium.com/umami-dao-snapshot-2-6de095d27af2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4 hover:underline"
                >
                  <span className="mr-2">
                    Learn more about the ARBIS to UMAMI exchange process and the rational behind it here.
                  </span>
                  <FaExternalLinkAlt className="inline pb-1" />
                </a>

                <a href="https://umami.finance/app/marinate"
                  className="block font-semibold underline mt-4 duration-100 max-w-[18rem] hover:text-umami-yellow"
                >
                  Deposit UMAMI for mUMAMI here!
                </a>
              </div>

              <div className="mt-4 md:mt-0">
                <FormCard>
                  <FormCard.Content>
                    <Formik
                      initialValues={{
                        amount: state.arbisBalance,
                      }}
                      onSubmit={({ amount }, { setSubmitting }) => {
                        handleMigrate(userSigner, migrationContract, String(amount))
                        setSubmitting(false)
                      }}
                      enableReinitialize
                    >
                      {({ values, isSubmitting, setFieldValue }) => (
                        <fieldset disabled={isSubmitting}>
                          <Form method="post">
                            <div className="flex flex-col">
                              <FormCard.FormField
                                label='ARBIS'
                                labelAccent={
                                  <button
                                    type="button"
                                    className="font-bold uppercase text-umami-pink hover:underline"
                                    onClick={() =>
                                      setFieldValue(
                                        'amount',
                                        state.arbisBalance
                                      )
                                    }
                                  >
                                    Exchange max
                                  </button>

                                }
                                name="amount"
                              />

                              <div className="mt-6 text-2xl flex items-center justify-center w-full">
                                <FaChevronCircleDown />
                              </div>

                              <label htmlFor="receiveAmount">
                                <div className="text-sm font-bold">
                                  UMAMI
                                </div>
                                <input
                                  name="receiveAmount"
                                  type="number"
                                  className="rounded border mt-2 px-2 h-10 text-lg font-bold bg-white disabled:opacity-100 text-black w-full disabled:cursor-not-allowed"
                                  disabled
                                  value={calcConvertedToken(
                                    String(values.amount)
                                  )}
                                />
                              </label>

                              <div className="flex items-center py-4 " style={{ display: "flex" }}>
                                {state.isApproved ? (
                                  <Button
                                    className="max-w"
                                    type="submit"
                                    disabled={!values.amount}
                                  >
                                    Migrate
                                  </Button>
                                ) : (
                                  <Button
                                    className="max-w"
                                    onClick={() => approveArbis(userSigner, arbisContract, state.tokenTotalSupply)}
                                  >
                                    Approve
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Form>
                        </fieldset>
                      )}
                    </Formik>

                    <div className="mt-4 flex flex-col text-center items-center">
                      <div className="text-lg">
                        <span className="block md:inline font-bold uppercase mr-2">
                          ARBIS Balance:
                        </span>
                        <span>{state.arbisBalance}</span>
                        <span> ARBIS </span>
                      </div>

                      <div className="text-lg mt-2">
                        <span className="block md:inline font-bold uppercase mr-2">
                          UMAMI Balance:
                        </span>
                        <span>{state.umamiBalance}</span>
                        <span> UMAMI </span>
                      </div>
                    </div>
                  </FormCard.Content>
                </FormCard>
              </div>
            </div>

            <div className="mt-20 flex items-center justify-center">
              <a
                href={`https://arbiscan.io/address/${MIGRATION_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex text-sm hover:underline"
              >
                <div className="mr-2">View contract on Arbiscan</div>
                <FaExternalLinkAlt />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
