import type { Accessor, Component } from "solid-js";
import { Show, createSignal, createEffect, createMemo } from "solid-js";
import { AuctionType, BidType } from "@encheres-immo/widget-client/types";
import client from "@encheres-immo/widget-client";
import { displayCurrencySymbol, displayAmountWithCurrency } from "./utils.jsx";
import CenteredModal from "./CenteredModal.jsx";
import { useAuctionTimer } from "./hooks/useAuctionTimer.js";
import { useDigressivePrice } from "./hooks/useDigressivePrice.js";

/**
 * Display both the bid form (with fast bid buttons and bid input) and the confirm bid modal.
 * For digressive auctions, shows a simplified "Accept price" interface.
 */
const BidForm: Component<{
  isLogged: () => boolean;
  auction: AuctionType;
}> = (props) => {
  // Initialize amount using current auction data.
  const [amount, setAmount] = createSignal(getBaseAmount(props.auction));
  const [isConfirmBidOpen, setIsConfirmBidOpen] = createSignal(false);
  const [isShowMinMessage, setIsShowMinMessage] = createSignal(false);
  const [isAmountTooHigh, setIsAmountTooHigh] = createSignal(false);
  const [fastBidMsg1, setFastBidMsg1] = createSignal(
    displayAmountOfStep(1, false, props.auction)
  );
  const [fastBidMsg2, setFastBidMsg2] = createSignal(
    displayAmountOfStep(2, false, props.auction)
  );
  const [fastBidMsg3, setFastBidMsg3] = createSignal(
    displayAmountOfStep(3, false, props.auction)
  );
  const [minValue, setMinValue] = createSignal(0);
  // Track if user has accepted the price in a digressive auction
  const [hasAcceptedPrice, setHasAcceptedPrice] = createSignal(false);
  const [acceptedPriceAmount, setAcceptedPriceAmount] = createSignal(0);

  // Create a memo to track auction changes
  const auctionData = createMemo(() => props.auction);

  // Use the timer hook to properly handle time-based status changes
  const { isInProgress, isDigressive } = useAuctionTimer(auctionData);

  // Use the digressive price hook
  const { priceState } = useDigressivePrice(auctionData);

  function getBaseAmount(auction: AuctionType) {
    return auction.highestBid
      ? auction.highestBid.amount + auction.step
      : auction.startingPrice;
  }

  // Update the default bid amount whenever the auction prop changes (e.g. a new highest bid)
  createEffect(() => {
    setAmount(getBaseAmount(props.auction));
  });

  /**
   * We display a warning message if the bid amount is too high.
   * Not used for digressive auctions.
   */
  function checkIfAmountTooHigh(auction: AuctionType, bidAmount: number) {
    if (auction.type === "digressive") {
      setIsAmountTooHigh(false);
      return;
    }
    if (bidAmount > getBaseAmount(auction) + auction.step * 2) {
      setIsAmountTooHigh(true);
    } else {
      setIsAmountTooHigh(false);
    }
  }

  /**
   * We display a warning message if the bid amount is too low.
   * Will be also checked server-side to avoid conflicts.
   */
  function checkIfAmountTooLow(auction: AuctionType, bidAmount: number) {
    if (bidAmount < getBaseAmount(auction)) {
      setIsShowMinMessage(true);
      setMinValue(getBaseAmount(auction));
    } else {
      setIsShowMinMessage(false);
    }
  }

  /**
   * Place a bid using the fast bid buttons.
   */
  function placeStepBid(stepMultiplier: number, auction: AuctionType) {
    return () => {
      let highestBid = auction.highestBid ? auction.highestBid.amount : null;
      let newAmount;

      if (highestBid !== null) {
        newAmount = highestBid + stepMultiplier * auction.step;
      } else {
        newAmount = auction.startingPrice + auction.step * (stepMultiplier - 1);
      }

      setAmount(newAmount);
      checkIfAmountTooHigh(auction, newAmount);
      checkIfAmountTooLow(auction, newAmount);
      setIsConfirmBidOpen(true);
    };
  }

  /**
   * Open confirm modal for digressive auction (accept current price).
   */
  function openDigressiveConfirm() {
    const currentPrice = priceState().currentPrice;
    setAmount(currentPrice);
    setIsConfirmBidOpen(true);
  }

  /**
   * Place a bid using the custom bid input.
   */
  function openConfirmBid() {
    return (e: Event) => {
      e.preventDefault(); // Prevent the form from being submitted
      // Check if the amount is valid
      if (Number.isInteger(amount()) && amount() < 0) {
        return;
      }
      checkIfAmountTooHigh(props.auction, amount());
      checkIfAmountTooLow(props.auction, amount());
      setIsConfirmBidOpen(true);
    };
  }

  function closeConfirmBid() {
    return () => {
      setIsShowMinMessage(false);
      setIsConfirmBidOpen(false);
    };
  }

  function confirmBid(amount: number, auction: AuctionType) {
    return () => {
      client
        .placeBidOnAuction(auction, amount)
        .then((newBid) => {
          setIsConfirmBidOpen(false);
          setIsShowMinMessage(false);
          emitBidEvent(newBid);

          // For digressive auctions, track that user has accepted the price
          if (auction.type === "digressive") {
            setHasAcceptedPrice(true);
            setAcceptedPriceAmount(newBid.amount);
          } else {
            setFastBidMsg1(displayAmountOfStep(1, true, auction));
            setFastBidMsg2(displayAmountOfStep(2, true, auction));
            setFastBidMsg3(displayAmountOfStep(3, true, auction));
          }
        })
        .catch((err) => {
          // We checked on the browser side, but a bid could have been placed in the meantime
          if (err.code == "bid_amount_too_low") {
            setIsShowMinMessage(true);
            setMinValue(err.min);
          }
        });
    };
  }

  function displayAmountOfStep(
    stepMultiplier: number,
    isNewBid: boolean,
    auction: AuctionType
  ) {
    let amount;
    if (isNewBid || (auction.bids && auction.bids.length > 0)) {
      amount = stepMultiplier * auction.step;
    } else {
      amount = (stepMultiplier - 1) * auction.step;
    }
    return displayAmountWithCurrency(amount, auction.currency);
  }

  /**
   * Emit a custom event to notify the parent component that a bid has been placed.
   * Can be used for tracking purposes or to display a bid notification.
   */
  function emitBidEvent(bid: BidType) {
    const event = new CustomEvent("auction-widget:bid_placed", {
      detail: {
        amount: bid.amount,
        date: bid.createdAt,
      },
    });
    document.getElementById("auction-widget")?.dispatchEvent(event);
  }

  return (
    <Show
      when={
        props.isLogged() &&
        props.auction.registration &&
        props.auction.registration.isRegistrationAccepted &&
        props.auction.registration.isParticipant &&
        isInProgress()
      }
    >
      <div class="auction-widget-section auction-widget-border-t">
        <div id="auction-widget-bid" data-testid="auction-widget-bid">
          {/* Digressive auction: simplified "Accept price" interface */}
          <Show when={isDigressive()}>
            <Show
              when={!hasAcceptedPrice()}
              fallback={
                <div class="auction-widget-digressive-accepted">
                  <p class="auction-widget-detail">
                    Votre offre :{" "}
                    {displayAmountWithCurrency(
                      acceptedPriceAmount(),
                      props.auction.currency
                    )}
                  </p>
                </div>
              }
            >
              <button
                class="auction-widget-btn auction-widget-custom"
                onClick={openDigressiveConfirm}
              >
                {displayAmountWithCurrency(
                  priceState().currentPrice,
                  props.auction.currency
                )}
              </button>
            </Show>
          </Show>

          {/* Progressive auction: full bid form with fast bid buttons and custom amount */}
          <Show when={!isDigressive()}>
            <p class="auction-widget-detail auction-widget-label auction-widget-text-left">
              Enchère rapide
            </p>
            <div id="auction-widget-fast-bid">
              <span>
                <button
                  class="auction-widget-btn auction-widget-custom"
                  onClick={placeStepBid(1, props.auction)}
                >
                  + {fastBidMsg1()}
                </button>
              </span>
              <span>
                <button
                  class="auction-widget-btn auction-widget-custom"
                  onClick={placeStepBid(2, props.auction)}
                >
                  + {fastBidMsg2()}
                </button>
              </span>
              <span>
                <button
                  class="auction-widget-btn auction-widget-custom"
                  onClick={placeStepBid(3, props.auction)}
                >
                  + {fastBidMsg3()}
                </button>
              </span>
            </div>
            <div class="auction-widget-history-area">
              <p class="auction-widget-detail auction-widget-label auction-widget-text-left">
                Votre montant
              </p>
              <form id="auction-widget-bid-form" onSubmit={openConfirmBid()}>
                {/* Bind the input's value to the reactive signal "amount" */}
                <input
                  type="number"
                  value={amount()}
                  onInput={(e) =>
                    setAmount(Number.parseInt(e.currentTarget.value))
                  }
                  min="0"
                  step="1"
                  required
                />
                <div id="auction-widget-currency">
                  <span>{displayCurrencySymbol(props.auction.currency)}</span>
                </div>
                <button
                  class="auction-widget-btn auction-widget-custom"
                  type="submit"
                >
                  Enchérir
                </button>
              </form>
            </div>
          </Show>
        </div>

        {/* Progressive auction confirm modal */}
        <Show when={isConfirmBidOpen() && !isDigressive()}>
          <CenteredModal title="Vous êtes sur le point d'enchérir" icon="gavel">
            <table id="auction-widget-table">
              <tbody>
                <Show when={props.auction.highestBid?.participantId}>
                  <tr>
                    <td class="auction-widget-td">Offre précédente</td>
                    <td class="auction-widget-amount">
                      {props.auction.highestBid &&
                        displayAmountWithCurrency(
                          props.auction.highestBid.amount
                        )}
                    </td>
                  </tr>
                </Show>
                <tr>
                  <td class="auction-widget-td">Votre offre</td>
                  <td class="auction-widget-amount">
                    {displayAmountWithCurrency(amount())}
                  </td>
                </tr>
              </tbody>
            </table>
            <Show when={isAmountTooHigh()}>
              <p class="auction-widget-modal-warning">
                Votre offre est sensiblement supérieure à l'offre précédente.
                Êtes-vous sûr de vouloir continuer ?
              </p>
            </Show>
            <Show when={isShowMinMessage()}>
              <p class="auction-widget-modal-warning">
                Vous devez au moins enchérir{" "}
                {displayAmountWithCurrency(minValue())}.
              </p>
            </Show>
            <div class="auction-widget-action">
              <button
                class="auction-widget-btn auction-widget-custom"
                onClick={confirmBid(amount(), props.auction)}
              >
                Confirmer
              </button>
              <button class="auction-widget-btn" onClick={closeConfirmBid()}>
                Annuler
              </button>
            </div>
          </CenteredModal>
        </Show>

        {/* Digressive auction confirm modal */}
        <Show when={isConfirmBidOpen() && isDigressive()}>
          <CenteredModal
            title="Vous êtes sur le point d'enchérir"
            icon="gavel"
          >
            <table id="auction-widget-table">
              <tbody>
                <tr>
                  <td class="auction-widget-td">Votre offre</td>
                  <td class="auction-widget-amount">
                    {displayAmountWithCurrency(
                      amount(),
                      props.auction.currency
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            <p class="auction-widget-modal-info">
              En enchérissant, vous clôturez la vente au prix indiqué.
            </p>
            <Show when={isShowMinMessage()}>
              <p class="auction-widget-modal-warning">
                Une erreur est survenue. Veuillez réessayer.
              </p>
            </Show>
            <div class="auction-widget-action">
              <button
                class="auction-widget-btn auction-widget-custom"
                onClick={confirmBid(amount(), props.auction)}
              >
                Confirmer
              </button>
              <button class="auction-widget-btn" onClick={closeConfirmBid()}>
                Annuler
              </button>
            </div>
          </CenteredModal>
        </Show>
      </div>
    </Show>
  );
};

export default BidForm;
