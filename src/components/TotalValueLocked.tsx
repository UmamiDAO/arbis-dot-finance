import React from 'react';
import axios from 'axios';

export default function TotalValueLocked() {
  // @ts-ignore
  const burgersIterator = [...Array(10).keys()];
  const initState: {
    status: string;
    arbisPrice: string | null;
    totalValueStaked: string | null;
  } = {
    status: 'idle',
    arbisPrice: null,
    totalValueStaked: null,
  };
  const [state, dispatch] = React.useReducer(
    (
      state: typeof initState,
      action:
        | { type: 'started'; payload?: null }
        | { type: 'error'; payload?: null }
        | { type: 'success'; payload: { arbisPrice: string; totalValueStaked: string } }
    ) => {
      switch (action.type) {
        case 'started':
          return { ...state, status: 'pending' };
        case 'error':
          return { ...state, status: 'rejected' };
        case 'success':
          return {
            ...state,
            status: 'resolved',
            arbisPrice: action.payload.arbisPrice,
            totalValueStaked: action.payload.totalValueStaked,
          };
        default:
          throw new Error('unsupported action type given on TotalValueLocked reducer');
      }
    },
    initState
  );

  const fetchPrice = React.useCallback(async () => {
    if (state.status !== 'idle') {
      return;
    }

    try {
      dispatch({ type: 'started' });
      const { data } = await axios('https://horseysauce.xyz');
      const { arbisPrice, tvl: totalValueStaked } = data;
      dispatch({ type: 'success', payload: { arbisPrice, totalValueStaked } });
    } catch (err) {
      console.log(err);
      dispatch({ type: 'error' });
    }
  }, [state.status]);

  React.useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  return (
    <div className="w-full text-light bg-primary">
      <div className="relative text-sm flex items-center justify-center text-center max-w-6xl m-auto">
        {state.arbisPrice !== null && state.totalValueStaked !== null ? (
          <>
            <span>
              Total value staked: ${Number(state.totalValueStaked).toLocaleString('en-us')}
            </span>
            <span className="absolute right-0">$${state.arbisPrice}</span>
          </>
        ) : (
          <>
            <span>$</span>
            <span className="wave">
              {burgersIterator.map((num, i) => (
                // @ts-ignore
                <span key={i} style={{ '--i': i }}>
                  🍔
                </span>
              ))}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
