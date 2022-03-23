import React from 'react'
import { Formik, Form, Field } from 'formik'

import DashboardCard from './DashboardCard'
import Selector from './Selector'

const farmAddress = '0x0000000000000000000000000000000000000000'

export default function MarinateAutocompounder() {
  const [action, setAction] = React.useState<'deposit' | 'withdraw'>('deposit')

  return (
    <section className="flex items-center">
      <div className="mt-8 w-full md:w-1/3">
        <DashboardCard>
          <DashboardCard.Title>MARINATE SHARES</DashboardCard.Title>

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
              Stake your _tokenSymbol_ for _name_ to earn passive $ETH generated
              by fees from all around the Arbi's food court automatically!
            </p>

            <div className="mt-8">
              <div className="flex justify-between">
                <strong>TVL:</strong>
                <div className="text-right">
                  {Math.round(Number(0)).toLocaleString()} $ _tokenSymbol
                </div>
              </div>

              <div className="flex justify-between">
                <strong>1 _symbol_:</strong>
                <div className="text-right">1 _tokenSymbol_</div>
              </div>
            </div>

            <div className="mt-4">
              <Selector>
                {['deposit', 'withdraw'].map((option) => (
                  <Selector.Item
                    key={option}
                    text={option}
                    onClick={() => setAction(option as 'deposit' | 'withdraw')}
                    selected={option === action}
                  />
                ))}
              </Selector>
            </div>

            {action === 'deposit' ? (
              <div className="mt-4">
                <Formik
                  initialValues={{ depositAmount: '0' }}
                  onSubmit={() => {}}
                >
                  {({ isSubmitting, handleSubmit, setFieldValue, values }) => (
                    <Form method="post">
                      <fieldset disabled={isSubmitting}>
                        <div>
                          <span>MAX: </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFieldValue(
                                'depositAmount',
                                Number(0).toFixed(9)
                              )
                            }
                            className="text-primary"
                          >
                            {Number(0).toFixed(3)}
                          </button>
                          <span> $_tokenSymbol_</span>
                        </div>

                        <Field
                          name="depositAmount"
                          className="border mt-2 border-gray-300 p-4 rounded w-full"
                          disabled={isSubmitting}
                          type="number"
                        />

                        <div className="mt-4">
                          <DashboardCard.Action
                            onClick={() => {}}
                            color="white"
                          >
                            {false ? (
                              <>
                                {isSubmitting ? (
                                  <span>staking...</span>
                                ) : (
                                  <span>stake</span>
                                )}
                              </>
                            ) : (
                              <span>approve</span>
                            )}
                          </DashboardCard.Action>
                        </div>
                      </fieldset>
                    </Form>
                  )}
                </Formik>
              </div>
            ) : null}

            {action === 'withdraw' ? (
              <div className="mt-4">
                <Formik
                  initialValues={{ withdrawAmount: '0' }}
                  onSubmit={() => {}}
                >
                  {({ isSubmitting, handleSubmit, setFieldValue, values }) => (
                    <Form method="post">
                      <div>
                        <span>MAX: </span>
                        <button
                          type="button"
                          onClick={() => {}}
                          className="text-primary"
                        >
                          {Number(0).toFixed(3)}
                        </button>
                        <span> $_tokenSymbol_</span>
                      </div>

                      <Field
                        name="withdrawAmount"
                        className="border mt-2 border-gray-300 p-4 rounded w-full"
                        disabled={isSubmitting}
                        type="number"
                      />

                      <div className="mt-4">
                        <DashboardCard.Action
                          onClick={() => {}}
                          color="white"
                          disabled
                        >
                          {false ? (
                            <>
                              {isSubmitting ? (
                                <span>withdrawing...</span>
                              ) : (
                                <span>withdraw</span>
                              )}
                            </>
                          ) : (
                            <span>approve</span>
                          )}
                        </DashboardCard.Action>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            ) : null}

            <div className="mt-4">
              <DashboardCard.Action color="black" disabled onClick={() => {}}>
                Collect Rewards
              </DashboardCard.Action>
            </div>
          </DashboardCard.Content>

          <DashboardCard.More>
            <strong>Current Rewards:</strong>

            <ul>
              <li className="flex justify-between">
                <div>_availableRewarToken_</div>
                <div>_symbol_</div>
              </li>
            </ul>
          </DashboardCard.More>
        </DashboardCard>
      </div>
    </section>
  )
}
