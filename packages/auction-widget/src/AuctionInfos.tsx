import { createMemo, type Component, Show } from "solid-js";
import { displayAmountWithCurrency, formatDate } from "./utils.jsx";
import { AuctionType, UserType } from "@encheres-immo/widget-client/types";
import { useAuctionTimer } from "./hooks/useAuctionTimer.js";

interface AuctionInfosProps {
  auction: AuctionType;
  user: UserType | undefined;
}

/**
 * Display auction details and countdown.
 */
const AuctionInfos: Component<AuctionInfosProps> = (props) => {
  // Create a memo of the auction to track changes
  const auctionData = createMemo(() => props.auction);

  // Use the timer hook
  const { timeRemaining, isNotStarted, isInProgress, isEnded } =
    useAuctionTimer(auctionData);

  // Check if the user can see bid information in private auctions
  const canViewBids = createMemo(() => {
    const auction = auctionData();
    return (
      !auction.isPrivate ||
      (auction.isPrivate &&
        auction.registration &&
        auction.registration.isUserAllowed &&
        auction.registration.isRegistrationAccepted)
    );
  });

  return (
    <div>
      <div id="auction-widget-header">
        <Show when={isNotStarted()}>
          <div>
            <p id="auction-widget-status">Démarre dans</p>
            <p id="auction-widget-countdown">{timeRemaining().formatted}</p>
          </div>
        </Show>
        <Show when={isInProgress()}>
          <div>
            <p id="auction-widget-status">Se termine dans</p>
            <p id="auction-widget-countdown">{timeRemaining().formatted}</p>
          </div>
        </Show>
        <Show when={isEnded()}>
          <p id="auction-widget-status">Vente terminée</p>
        </Show>
      </div>
      <div>
        <div id="auction-widget-description">
          <div>
            <p class="auction-widget-detail auction-widget-label">Début</p>
            <p class="auction-widget-detail">
              {formatDate(auctionData().startDate)}
            </p>
          </div>
          <div>
            <p class="auction-widget-detail auction-widget-label">Fin</p>
            <p class="auction-widget-detail">
              {formatDate(auctionData().endDate)}
            </p>
          </div>
          <div>
            <p class="auction-widget-detail auction-widget-label">
              Prix de départ
            </p>
            <p class="auction-widget-detail auction-widget-accent">
              {displayAmountWithCurrency(
                auctionData().startingPrice,
                auctionData().currency
              )}
            </p>
          </div>
          <div>
            <p class="auction-widget-detail auction-widget-label">Palier</p>
            <p class="auction-widget-detail auction-widget-accent">
              {displayAmountWithCurrency(
                auctionData().step,
                auctionData().currency
              )}
            </p>
          </div>
        </div>
        <div class="auction-widget-section auction-widget-border-t">
          <div>
            <Show
              when={canViewBids()}
              fallback={
                <div>
                  <p class="auction-widget-detail auction-widget-label">
                    Vente privée
                  </p>
                  <p class="auction-widget-detail">
                    Inscrivez-vous pour voir les participations
                  </p>
                </div>
              }
            >
              <p class="auction-widget-detail auction-widget-label">
                Meilleure offre
              </p>
              <p class="auction-widget-detail auction-widget-accent">
                {auctionData().highestBid?.participantId
                  ? displayAmountWithCurrency(
                      auctionData().highestBid.amount,
                      auctionData().currency
                    )
                  : displayAmountWithCurrency(null, auctionData().currency)}
              </p>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionInfos;
