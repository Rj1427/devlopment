import reducer, {
  increment,
  decrement,
  incrementByAmount,
  incrementAsync,
} from '../features/counter/counterSlice';

describe('counter slice', () => {
  const initialState = { value: 0, status: 'idle' };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle increment', () => {
    const actual = reducer(initialState, increment());
    expect(actual.value).toEqual(1);
  });

  it('should handle decrement', () => {
    const actual = reducer({ value: 1, status: 'idle' }, decrement());
    expect(actual.value).toEqual(0);
  });

  it('should handle incrementByAmount', () => {
    const actual = reducer(initialState, incrementByAmount(5));
    expect(actual.value).toEqual(5);
  });

  it('should handle incrementAsync (fulfilled)', () => {
    const pendingState = reducer(initialState, incrementAsync.pending());
    expect(pendingState.status).toEqual('loading');

    const fulfilledState = reducer(initialState, incrementAsync.fulfilled(3));
    expect(fulfilledState.status).toEqual('idle');
    expect(fulfilledState.value).toEqual(3);
  });
});
