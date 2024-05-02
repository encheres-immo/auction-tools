import type { Component } from "solid-js";
import { Show, createSignal } from "solid-js";
import { AuctionType, BidType } from "@encheres-immo/widget-client/types";
import client from "@encheres-immo/widget-client";
import { displayCurrencySymbol, displayAmountWithCurrency } from "./utils.js";
import CenteredModal from "./CenteredModal.js";

const Bid: Component<{ auction: AuctionType }> = (props) => {
  const defaultAmount = props.auction.highestBid
    ? props.auction.highestBid.amount + props.auction.step
    : props.auction.startingPrice;
  let [amount, setAmount] = createSignal(defaultAmount);
  const [isConfirmBidOpen, setIsConfirmBidOpen] = createSignal(false);
  const [isShowMinMessage, setIsShowMinMessage] = createSignal(false);
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

  function placeStepBid(stepMultiplier: number, auction: AuctionType) {
    return () => {
      console.log(auction.step);
      let highestBid = auction.highestBid ? auction.highestBid.amount : null;
      let newAmount;

      if (highestBid) {
        newAmount = highestBid + stepMultiplier * auction.step;
      } else {
        newAmount = auction.startingPrice + auction.step * (stepMultiplier - 1);
      }

      setAmount(newAmount);

      console.log("Placing bid", amount());
      console.log("Auction", auction);
      setIsConfirmBidOpen(true);
    };
  }

  function openConfirmBid() {
    return () => setIsConfirmBidOpen(true);
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

  function displayAmountOfStep(stepMultiplier: number, isNewBid: boolean, auction: AuctionType) {
    let amount;
    if (isNewBid || (auction.bids && auction.bids.length > 0)) {
      amount = stepMultiplier * auction.step;
    } else {
      amount = (stepMultiplier - 1) * auction.step;
    }
    return displayAmountWithCurrency(amount, auction.currency);
  }

  return (
    <div class="border-dark mx-4 flex flex-col gap-4 border-t py-4">
      <div class="text-dark relative text-sm tracking-wider">
        <p class="font-barnes-title font-semibold uppercase">Enchère rapide</p>
        <div class="grid grid-cols-3 gap-2 pt-1">
          <span>
            <button
              class="bg-secondary border-secondary active:ring-secondary group inline-flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-medium leading-5 text-white hover:bg-opacity-80 active:ring-2"
              onClick={placeStepBid(1, props.auction)}
            >
              +{fastBidMsg1()}
            </button>
          </span>
          <span>
            <button
              class="bg-secondary border-secondary active:ring-secondary group inline-flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-medium leading-5 text-white hover:bg-opacity-80 active:ring-2"
              onClick={placeStepBid(2, props.auction)}
            >
              +{fastBidMsg2()}
            </button>
          </span>
          <span>
            <button
              class="bg-secondary border-secondary active:ring-secondary group inline-flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-medium leading-5 text-white hover:bg-opacity-80 active:ring-2"
              onClick={placeStepBid(3, props.auction)}
            >
              +{fastBidMsg3()}
            </button>
          </span>
        </div>
        <div class="text-dark relative text-sm tracking-wider">
          <p class="font-barnes-title font-semibold uppercase">Votre montant</p>
          <div class="relative mt-1 flex flex-col gap-2">
            <input
              class="ring-secondary focus:border-secondary block w-full appearance-none rounded-md border border-slate-400 p-2 text-center text-base leading-5 placeholder-slate-400 ring-0 focus:ring-2 sm:text-sm sm:leading-5"
              type="number"
              value={amount()}
              onInput={(e) => setAmount(parseInt(e.currentTarget.value))}
              min="0"
              step="1"
            />
            <div class="pointer-events-none absolute right-3 top-2 flex items-center">
              <span class="text-dark leading-relaxed">
                {displayCurrencySymbol(props.auction.currency)}
              </span>
            </div>
            <button
              class="bg-secondary border-secondary active:ring-secondary group inline-flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-medium leading-5 text-white hover:bg-opacity-80 active:ring-2"
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
          icon_class=""
          icon_bg_class=""
        >
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <div class="sm:flex sm:items-start">
              <div class="bg-secondary mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-opacity-25 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  class="text-secondary h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <div class="mt-4">
                <Show when={isShowMinMessage()}>
                  <p class="mt-2 text-sm text-red-600" id="email-error">
                    Vous devez au moins enchérir{" "}
                    {displayAmountWithCurrency(minValue())}
                  </p>
                </Show>
                <table>
                  <tbody>
                    <tr>
                      <td class="pr-4 text-xs uppercase tracking-wider text-gray-400">
                        Offre précédente
                      </td>
                      <td class="pl-2 text-base text-gray-600">
                        {displayAmountWithCurrency(
                          props.auction.highestBid.amount
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td class="pr-4 text-xs uppercase tracking-wider text-gray-400">
                        Votre offre
                      </td>
                      <td class="pl-2 text-base text-gray-600">
                        {displayAmountWithCurrency(amount())}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <span class="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                <button
                  class="bg-secondary hover:bg-secondary focus:bg-secondary focus:border-secondary ring-secondary inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base leading-6 text-white shadow-sm ring-0 transition duration-150 ease-in-out hover:bg-opacity-75 focus:outline-none focus:ring-2 sm:text-sm sm:leading-5"
                  onClick={confirmBid(amount(), props.auction)}
                >
                  Confirmer
                </button>
              </span>
              <span class="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
                <button
                  class="focus:border-primary inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base leading-6 text-gray-700 shadow-sm transition duration-150 ease-in-out hover:text-gray-500 focus:outline-none focus:ring sm:text-sm sm:leading-5"
                  onClick={closeConfirmBid()}
                >
                  Annuler
                </button>
              </span>
            </div>
          </div>
        </CenteredModal>
      </Show>
    </div>
  );
};

export default Bid;
