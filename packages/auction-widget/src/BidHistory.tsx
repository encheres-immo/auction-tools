import {
  createSignal,
  createEffect,
  type Component,
  For,
  Show,
} from "solid-js";
import {
  displayAmountWithCurrency,
  isAuctionEnded,
  isAuctionInProgress,
  formatDate,
} from "./utils.js";
import {
  AuctionType,
  BidType,
  UserType,
} from "@encheres-immo/widget-client/types";
import { Icon } from "./Spritesheet.jsx";

interface BidHistoryProps {
  bids: BidType[];
  auction: AuctionType;
  user: UserType | undefined;
}

/**
 * Display every bid made on an auction.
 */
const BidHistory: Component<BidHistoryProps> = (props) => {
  const [auctionInProgress, setAuctionInProgress] = createSignal(
    isAuctionInProgress(props.auction)
  );

  // Re-compute auction status when relevant auction properties change
  createEffect(() => {
    const { status, bids } = props.auction;
    setAuctionInProgress(isAuctionInProgress(props.auction));
  });

  return (
    <>
      <Show
        when={
          (isAuctionEnded(props.auction) ||
            (auctionInProgress() && props.bids.length > 0)) &&
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
                {(bid) => (
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
                          <Icon
                            name="user"
                            svgClass="auction-widget-user-icon"
                          />
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
    </>
  );
};

export default BidHistory;
