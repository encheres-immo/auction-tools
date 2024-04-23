import type { Component } from "solid-js";
import { For, Show, createSignal } from "solid-js";
import {
  AuctionType,
  BidType,
  UserType,
} from "@encheres-immo/widget-client/types";
import { displayAmountWithCurrency, formatDate } from "./utils.js";

const BidHistory: Component<{
  bids: BidType[];
  auction: AuctionType;
  user: UserType;
}> = (props: any) => {
  return (
    <div class="border-dark mx-4 border-t py-4">
      <div class="text-dark relative text-sm tracking-wider">
        <p class="font-barnes-title font-semibold uppercase">
          Historique des offres
        </p>
        <ul class="mt-2 max-h-72 overflow-y-scroll">
          <For each={[...props.bids].sort((a, b) => b.amount - a.amount)}>
            {(bid, i) => (
              <li class="animate-slidein mb-3 flex">
                <Show
                  when={bid.participantId === props.user.id}
                  fallback={
                    <div class="w-2/3 grow">
                      <p class="text-dark text-xs leading-normal">
                        Le {formatDate(bid.createdAt)}
                      </p>
                      <span class="bg-secondary inline-flex cursor-default items-center rounded-full px-2.5 pb-[3px] pt-1 text-xs font-medium leading-4 text-white">
                        <i class="fas fa-user pr-1"></i>
                        {bid.userAnonymousId}
                      </span>
                      a enchéri
                    </div>
                  }
                >
                  <div class="w-2/3 grow">
                    <p class="text-dark text-xs leading-normal">
                      Le {formatDate(bid.createdAt)}
                    </p>
                    <span class="bg-secondary inline-flex cursor-default items-center rounded-full px-2.5 pb-[3px] pt-1 text-xs font-medium leading-4 text-white">
                      <i class="fas fa-user pr-1"></i>Vous
                    </span>
                    avez enchéri
                  </div>
                </Show>
                <p class="text-dark py-1 text-sm leading-loose">
                  {displayAmountWithCurrency(
                    bid.amount,
                    props.auction.currency
                  )}
                </p>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
};

export default BidHistory;
