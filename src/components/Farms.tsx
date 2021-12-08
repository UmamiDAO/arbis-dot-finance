import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Selector from './Selector';
import ArbisFarms from './ArbisFarms';

const tokens = ['arbis', 'sushi', 'swapr', 'nyan', 'legacy'];

export default function Farms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const fallbackParams = React.useCallback(() => {
    if (!tokens.includes(token)) {
      setSearchParams({ token: 'arbis' });
    }
  }, [token, setSearchParams]);

  React.useEffect(() => {
    fallbackParams();
  }, [fallbackParams]);

  return (
    <main>
      <h1 className="text-3xl md:text-5xl">farms🌾</h1>

      <nav className="mt-4">
        <Selector>
          {tokens.map((item) => (
            <Selector.Item
              key={item}
              text={`${item} farms`}
              onClick={() => setSearchParams({ token: item })}
              selected={item === token}
            />
          ))}
        </Selector>
      </nav>

      {token === 'arbis' ? <ArbisFarms /> : null}
    </main>
  );
}
