import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import {
  AuctionType,
  BidType,
  UserType,
} from "@encheres-immo/widget-client/types";
import {
  displayAmountWithCurrency,
  isAuctionEnded,
  isAuctionInProgress,
  formatDate,
} from "./utils.js";
import { Icon } from "./Spritesheet.jsx";

/**
 * Display every bid made on an auction.
 */
const BidHistory: Component<{
  bids: BidType[];
  auction: AuctionType;
  user: UserType | undefined;
}> = (props: any) => {
  return (
    <Show
      when={
        // Display bid history if auction is ended or in progress with bids
        (isAuctionEnded(props.auction) ||
          (isAuctionInProgress(props.auction) && props.bids.length > 0)) &&
        // Display bid history if auction is public or user is allowed
        (!props.auction.isPrivate ||
          (props.auction.isPrivate &&
            props.auction.registration &&
            props.auction.registration.isUserAllowed &&
            props.auction.registration.isRegistrationAccepted))
      }
    >
      <div class="auction-widget-section auction-widget-border-t">
        <div id="auction-widget-history-area">
          <p class="auction-widget-label auction-widget-detail">
            Historique des offres
          </p>
          <ul id="auction-widget-scroll">
            <For each={[...props.bids].sort((a, b) => b.amount - a.amount)}>
              {(bid, i) => (
                <li>
                  <Show
                    when={props.user && bid.participantId === props.user.id}
                    fallback={
                      <div>
                        <p class="auction-widget-date">
                          Le {formatDate(bid.createdAt)}
                        </p>
                        <span class="auction-widget-user">
                          <Icon
                            name="user"
                            svgClass="auction-widget-user-icon"
                          />
                          {bid.userAnonymousId}
                        </span>
                        a enchéri
                      </div>
                    }
                  >
                    <div>
                      <p class="auction-widget-date">
                        Le {formatDate(bid.createdAt)}
                      </p>
                      <span class="auction-widget-user">
                        <Icon name="user" svgClass="auction-widget-user-icon" />
                        Vous
                      </span>
                      avez enchéri
                    </div>
                  </Show>
                  <p id="auction-widget-bid-amount">
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
    </Show>
  );
};

export default BidHistory;
