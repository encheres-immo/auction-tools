import type { Component } from "solid-js";
import { Show, createSignal } from "solid-js";
import { AuctionType } from "@encheres-immo/widget-client/types";
import client from "@encheres-immo/widget-client";
import { displayCurrencySymbol, displayAmountWithCurrency } from "./utils.js";
import CenteredModal from "./CenteredModal.js";

/**
 * Display both the bid form (with fast bid buttons and bid input) and the confirm bid modal.
 */
const Bid: Component<{ auction: AuctionType }> = (props) => {
  const defaultAmount = props.auction.highestBid
    ? props.auction.highestBid.amount + props.auction.step
    : props.auction.startingPrice;
  let [amount, setAmount] = createSignal(defaultAmount);
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

  function checkIfAmountTooHigh(auction: AuctionType, bidAmount: number) {
    const highestBidAmount = auction.highestBid
      ? auction.highestBid.amount
      : auction.startingPrice - auction.step;
    if (bidAmount > highestBidAmount + auction.step * 3) {
      setIsAmountTooHigh(true);
    } else {
      setIsAmountTooHigh(false);
    }
  }

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
      setIsConfirmBidOpen(true);
    };
  }

  function openConfirmBid() {
    return () => {
      checkIfAmountTooHigh(props.auction, amount());
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

          setFastBidMsg1(displayAmountOfStep(1, true, auction));
          setFastBidMsg2(displayAmountOfStep(2, true, auction));
          setFastBidMsg3(displayAmountOfStep(3, true, auction));
        })
        .catch((err) => {
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

  return (
    <div class="auction-widget-section auction-widget-border-t">
      <div id="auction-widget-bid" data-testid="auction-widget-bid">
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
          <div id="auction-widget-bid-form">
            <input
              type="number"
              value={amount()}
              onInput={(e) => setAmount(parseInt(e.currentTarget.value))}
              min="0"
              step="1"
            />
            <div id="auction-widget-currency">
              <span>{displayCurrencySymbol(props.auction.currency)}</span>
            </div>
            <button
              class="auction-widget-btn auction-widget-custom"
              onClick={openConfirmBid()}
            >
              Enchérir
            </button>
          </div>
        </div>
      </div>
      <Show when={isConfirmBidOpen()}>
        <CenteredModal
          title="Vous êtes sur le point d'enchérir"
          success={false}
          icon_class="fas fa-gavel"
        >
          <table id="auction-widget-table">
            <tbody>
              <Show when={props.auction.highestBid.participantId}>
                <tr>
                  <td class="auction-widget-td">Offre précédente</td>
                  <td class="auction-widget-amount">
                    {displayAmountWithCurrency(props.auction.highestBid.amount)}
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
            <p class="auction-widget-modal-note">
              Votre offre est sensiblement supérieure à l'offre précédente.
              Êtes-vous sûr de vouloir continuer ?
            </p>
          </Show>
          <Show when={isShowMinMessage()}>
            <p id="email-error" class="auction-widget-modal-note">
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
    </div>
  );
};

export default Bid;
