import type { Component } from 'solid-js';
import { For, Show, createSignal } from 'solid-js';
import {AuctionType, BidType, UserType} from './types/types';
import { displayAmountWithCurrency, formatDate } from './utils';

const BidHistory: Component<{bids: BidType[], auction: AuctionType, user: UserType}> = (props: any) => {
  return (
    <div class="mx-4 py-4 border-t border-dark">
      <div class="relative text-sm text-dark tracking-wider">
        <p class="font-semibold uppercase font-barnes-title">
          Historique des offres
        </p>
        <ul class="overflow-y-scroll max-h-72 mt-2">
          <For each={[...props.bids].sort((a, b) => b.amount - a.amount)}>{(bid, i) =>
            <li class="mb-3 flex animate-slidein">
              <Show when={bid.participantId === props.user.id} fallback={<div class="w-2/3 grow">
                  <p class="text-dark text-xs leading-normal">Le {formatDate(bid.createdAt)}</p>
                  <span class="inline-flex items-center rounded-full font-medium px-2.5 pb-[3px] pt-1 leading-4 text-xs bg-secondary text-white cursor-default">
                    <i class="fas fa-user pr-1"></i>{bid.userAnonymousId}</span>
                  a enchéri
                </div>}>
                <div class="w-2/3 grow">
                  <p class="text-dark text-xs leading-normal">Le {formatDate(bid.createdAt)}</p>
                  <span class="inline-flex items-center rounded-full font-medium px-2.5 pb-[3px] pt-1 leading-4 text-xs bg-secondary text-white cursor-default">
                    <i class="fas fa-user pr-1"></i>Vous</span>
                  avez enchéri
                </div>
              </Show>
              <p class="text-dark text-sm py-1 leading-loose">
              {displayAmountWithCurrency(bid.amount, props.auction.currency)}
              </p>
            </li>
          }</For>
        </ul>
      </div>
    </div>
  );
};

export default BidHistory;
