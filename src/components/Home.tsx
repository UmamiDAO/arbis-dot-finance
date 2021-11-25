import React from 'react';
import ArbisSpinner from './ArbisSpinner';
import useGlobalState from '../hooks/useGlobalState';

const foodCourtLinks = [
  {
    text: 'ArbiCheems.Finance',
    href: 'https://arbicheems.finance',
  },
  {
    text: 'ZEROTWOHM',
    href: 'https://zerotwohm.finance/',
  },
  {
    text: 'CheemsHole',
    href: '#',
  },
];

export default function Home() {
  const [{ injectedProvider }] = useGlobalState();

  return (
    <main>
      {injectedProvider === null ? (
        <div className="w-full m-auto max-w-3xl p-4 flex flex-col items-center justify-center">
          <ArbisSpinner />
          <p className="mt-4">Connect your wallet on the Arbitrum Network</p>
        </div>
      ) : (
        <div className="w-full m-auto max-w-3xl p-4 mt-4">
          <header>
            <h1 className="text-3xl">Arbi's Finance</h1>

            <p className="mt-4">
              Arbi’s Finance is the creator of the Arbi's food court, an ecosystem of burger-themed
              DeFi projects built on the Arbitrum network.
            </p>
          </header>

          <div className="relative w-full mt-4">
            <img
              src="/assets/arbis-food-court-v3.png"
              alt="Arbi's Food Court: ArbiCheems, ZEROTWOHM, CheemsHole"
            />
            <div className="absolute inset-0 flex">
              {foodCourtLinks.map(({ text, href }) => (
                <a
                  href={href}
                  key={text}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 mr-6 last:mr-0 ${href === '#' ? 'pointer-events-none' : ''}`}
                >
                  <span className="sr-only">{text}</span>
                </a>
              ))}
            </div>
          </div>

          <section className="mt-12">
            <h2 className="text-2xl">Projects</h2>

            <ul>
              <li className="mt-4">
                <span className="text-blue-500">Arbi's</span> - Autocompounders for most yield
                opportunities on Arbitrum. Stake now to maximize yields and save time.
              </li>

              <li className="mt-4">
                <a
                  href="https://zerotwohm.finance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  ZeroTwOhm
                </a>
                &nbsp;
                <span>
                  - The first decentralized reserve currency protocol natively built on the Arbitrum
                  One Network.
                </span>
              </li>

              <li className="mt-4">
                <a
                  href="https://arbicheems.finance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  ArbiCheems
                </a>
                &nbsp;
                <span>
                  - A simple, highly deflationary, meme coin. Stake your assets and receive the
                  CHEEMS
                </span>
                token.
              </li>

              <li className="mt-4">
                <a
                  href="https://cheemshole.arbicheems.finance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  CheemsHole
                </a>
                &nbsp;
                <span>
                  - A winner takes all degen gambling game for CHEEMS, a revised version of
                  Blackhole.
                </span>
              </li>
            </ul>
          </section>

          <section className="mt-4">
            <h2 className="text-2xl">Documentation</h2>

            <p className="mt-4">
              <span>You can read more about the food court and our tokenomics in our Gitbook</span>
              &nbsp;
              <a
                href="https://arbisfinance.gitbook.io/food-court/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-blue-500 hover:underline"
              >
                here
              </a>
              .
            </p>
          </section>

          <section className="mt-4">
            <h2 className="text-2xl">Disclaimer</h2>

            <p className="mt-4">
              Please use our products responsibility, and never invest more than you can afford to
              lose. Arbi’s Finance does not guarantee compensation for any of our users in the event
              of exploits, hacks, and other unforeseeable negative events.
            </p>
          </section>

          <aside className="mt-12">
            <hr></hr>

            <p className="font-bold mt-4 text-center text-sm">
              Warning: high risk of extreme volatility of underlying assets and smart contracts. All
              contracts have not been formally audited.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
