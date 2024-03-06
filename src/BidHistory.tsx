import type { Component } from 'solid-js';
import { For, createSignal } from 'solid-js';
import {BidType} from './types/types';

const BidHistory: Component<{bids: BidType[]}> = (props: any) => {
  return (
    <div>
      Bids:
      <For each={[...props.bids].sort((a, b) => b.amount - a.amount)}>{(bid, i) =>
        <li>
          {bid.amount} - {bid.userAnonymousId}
        </li>
      }</For>
    </div>
  );
};

export default BidHistory;
