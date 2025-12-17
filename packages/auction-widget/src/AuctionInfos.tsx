import { createMemo, type Component, Show } from "solid-js";
import { displayAmountWithCurrency, formatDate } from "./utils.jsx";
import { AuctionType, UserType } from "@encheres-immo/widget-client/types";
import { useAuctionTimer } from "./hooks/useAuctionTimer.js";
import { useDigressivePrice } from "./hooks/useDigressivePrice.js";

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
  const {
    timeRemaining,
    digressiveStepInfo,
    isDigressive,
    isNotStarted,
    isInProgress,
    isEnded,
  } = useAuctionTimer(auctionData);

  // Use the digressive price hook
  const { priceState } = useDigressivePrice(auctionData);

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

  /**
   * Get the displayed price based on auction type and state.
   * - Progressive: highest bid amount or null
   * - Digressive in progress: current calculated price (decreasing over time)
   * - Ended auction: finalPrice from WebSocket, or highest bid, or starting price
   */
  const displayedPrice = createMemo(() => {
    const auction = auctionData();

    // For ended auctions, prefer finalPrice from WebSocket event
    if (isEnded()) {
      if (auction.finalPrice != null) {
        return auction.finalPrice;
      }
      // Fallback to highest bid or starting price
      return auction.highestBid?.participantId
        ? auction.highestBid.amount
        : auction.startingPrice;
    }

    // In progress: digressive shows current calculated price, progressive shows highest bid
    if (auction.type === "digressive") {
      return priceState().currentPrice;
    }
    return auction.highestBid?.participantId ? auction.highestBid.amount : null;
  });

  /**
   * Get the label for the price section.
   * - Progressive: "Meilleure offre"
   * - Digressive in progress: "Prix actuel"
   * - Digressive ended: "Meilleure offre" (bluff behavior: always show as if sold)
   */
  const priceLabel = createMemo(() => {
    if (isDigressive() && !isEnded()) {
      return "Prix actuel";
    }
    return "Meilleure offre";
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
            <p id="auction-widget-status">
              {isDigressive() ? "Prochain palier" : "Se termine dans"}
            </p>
            <p
              id="auction-widget-countdown"
              class={digressiveStepInfo().isWarning ? "auction-widget-warning" : ""}
            >
              {isDigressive()
                ? digressiveStepInfo().formatted
                : timeRemaining().formatted}
            </p>
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
              {isDigressive() && !isEnded()
                ? "Inconnue"
                : formatDate(auctionData().endDate)}
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
                {priceLabel()}
              </p>
              <p class="auction-widget-detail auction-widget-accent">
                {displayAmountWithCurrency(
                  displayedPrice(),
                  auctionData().currency
                )}
              </p>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionInfos;
