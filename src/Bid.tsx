import type { Component } from 'solid-js';
import { Show, createSignal } from "solid-js"
import {AuctionType, BidType} from './types/types';
import client from './services/client';
import { displayCurrencySymbol, displayAmountWithCurrency } from './utils';
import CenteredModal from './CenteredModal';



const Bid: Component<{auction: AuctionType}> = (props) => {
  const defaultAmount = props.auction.highestBid ? props.auction.highestBid.amount + props.auction.step : props.auction.startingPrice;
  let [amount, setAmount] = createSignal(defaultAmount);
  const [isConfirmBidOpen, setIsConfirmBidOpen] = createSignal(false);
  const [isShowMinMessage, setIsShowMinMessage] = createSignal(false);
  const [minValue, setMinValue] = createSignal(0);

  function placeStepBid(stepMultiplier: number, auction: AuctionType) {
    return () => {
      console.log(auction.step)
      console.log('Highest bid', auction.highestBid.amount);
      const highestBid = auction.highestBid.amount || auction.startingPrice;
      const newAmount = highestBid + stepMultiplier * auction.step;
      setAmount(newAmount);

      console.log('Placing bid', amount());
      console.log('Auction', auction);
      // return openConfirmBid();
      setIsConfirmBidOpen(true);
    }
  }

  function openConfirmBid() {
    return () => setIsConfirmBidOpen(true);
  }
  
  function closeConfirmBid() {
    return () => {
      setIsShowMinMessage(false)
      setIsConfirmBidOpen(false)
    }
  }

  function confirmBid(amount: number, auction: AuctionType) {
    return () => {
      client.placeBidOnAuction(auction, amount).then((newAuction) => {
        setIsConfirmBidOpen(false);
        setIsShowMinMessage(false);
      }).catch((err) => {
        if(err.code == 'bid_amount_too_low') {
          setIsShowMinMessage(true)
          setMinValue(err.min)
        }
      });
    }
  }

  return (
    <div class="mx-4 py-4 border-t border-dark flex flex-col gap-4">
      <div class="relative text-sm text-dark tracking-wider">
        <p class="font-semibold uppercase font-barnes-title">Enchère rapide</p>
        <div class="pt-1 grid grid-cols-3 gap-2">
          <span>
            <button class="group inline-flex items-center font-medium border justify-center cursor-pointer px-3 py-2 text-sm rounded-lg leading-5 gap-x-2 w-full bg-secondary border-secondary text-white hover:bg-opacity-80 active:ring-2 active:ring-secondary" onClick={placeStepBid(1, props.auction)}>
              +{displayAmountWithCurrency(props.auction.step, props.auction.currency)}
            </button>
            </span>
          <span>
            <button class="group inline-flex items-center font-medium border justify-center cursor-pointer px-3 py-2 text-sm rounded-lg leading-5 gap-x-2 w-full bg-secondary border-secondary text-white hover:bg-opacity-80 active:ring-2 active:ring-secondary" onClick={placeStepBid(2, props.auction)}>
              +{displayAmountWithCurrency(props.auction.step * 2, props.auction.currency)}
            </button>
          </span>
          <span>
            <button class="group inline-flex items-center font-medium border justify-center cursor-pointer px-3 py-2 text-sm rounded-lg leading-5 gap-x-2 w-full bg-secondary border-secondary text-white hover:bg-opacity-80 active:ring-2 active:ring-secondary" onClick={placeStepBid(3, props.auction)}>
              +{displayAmountWithCurrency(props.auction.step * 3, props.auction.currency)}
            </button>
          </span>
        </div>
        <div class="relative text-sm text-dark tracking-wider">
          <p class="font-semibold uppercase font-barnes-title">Votre montant</p>
          <div class="flex flex-col mt-1 gap-2 relative">
            <input class="appearance-none border rounded-md p-2 text-base leading-5 border-slate-400 placeholder-slate-400 block w-full text-center sm:text-sm sm:leading-5 ring-secondary ring-0 focus:border-secondary focus:ring-2" type="number" value={amount()} onInput={(e) => setAmount(parseInt(e.currentTarget.value))} min="0" step="1" />
            <div class="absolute top-2 right-3 flex items-center pointer-events-none">
              <span class="text-dark leading-relaxed">
                {displayCurrencySymbol(props.auction.currency)}
              </span> 
            </div>
            <button class="group inline-flex items-center font-medium border justify-center cursor-pointer px-3 py-2 text-sm rounded-lg leading-5 gap-x-2 w-full bg-secondary border-secondary text-white hover:bg-opacity-80 active:ring-2 active:ring-secondary" onClick={openConfirmBid()}>Enchérir</button>
          </div>
        </div>
      </div>
      <Show when={isConfirmBidOpen()}>
        <CenteredModal title="Vous êtes sur le point d'enchérir" success={false} icon_class="" icon_bg_class="" >
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-secondary bg-opacity-25 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-secondary" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div class="mt-4">
                <Show when={isShowMinMessage()}>
                  <p class="mt-2 text-sm text-red-600" id="email-error">Vous devez au moins enchérir {displayAmountWithCurrency(minValue())}</p>
                </Show>
                <table>
                  <tbody>
                    <tr>
                      <td class="pr-4 text-gray-400 uppercase text-xs tracking-wider">Offre précédente</td>
                      <td class="text-base pl-2 text-gray-600">{displayAmountWithCurrency(props.auction.highestBid.amount)}</td>
                    </tr>
                    <tr>
                      <td class="pr-4 text-gray-400 uppercase text-xs tracking-wider">Votre offre</td>
                      <td class="text-base pl-2 text-gray-600">{displayAmountWithCurrency(amount())}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <span class="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                <button class="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-secondary text-base leading-6 text-white shadow-sm hover:bg-secondary hover:bg-opacity-75 focus:outline-none focus:bg-secondary focus:border-secondary ring-secondary ring-0 focus:ring-2 transition ease-in-out duration-150 sm:text-sm sm:leading-5" onClick={confirmBid(amount(), props.auction)}>Confirmer</button>
              </span>
              <span class="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
                <button class="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-primary focus:ring transition ease-in-out duration-150 sm:text-sm sm:leading-5" onClick={closeConfirmBid()}>Annuler</button>
              </span>
            </div>
          </div>
        </CenteredModal>
      </Show>
    </div>
  );
};

export default Bid;
