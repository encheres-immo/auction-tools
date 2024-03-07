import type { Component } from 'solid-js';
import { Show, createSignal } from "solid-js"
import {AuctionType, BidType} from './types/types';
import client from './services/client';



const Bid: Component<{auction: AuctionType}> = (props) => {
  const defaultAmount = props.auction.highestBid ? props.auction.highestBid.amount + props.auction.step : props.auction.startingPrice;
  let [amount, setAmount] = createSignal(defaultAmount);
  const [isConfirmBidOpen, setIsConfirmBidOpen] = createSignal(false);

  function placeStepBid(stepMultiplier: number, auction: AuctionType) {
    return () => {
      console.log(auction.step)
      console.log('Highest bid', auction.highestBid.amount);
      const newAmount = auction.highestBid.amount + stepMultiplier * auction.step;
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
    return () => setIsConfirmBidOpen(false);
  }

  function confirmBid(amount: number, auction: AuctionType) {
    return () => {
      client.placeBidOnAuction(auction, amount).then((newAuction) => {
        
      });
      setIsConfirmBidOpen(false);
    }
  }

  return (
    <div>
      <div>
        <h1>Enchérir</h1>
        <button onClick={placeStepBid(1, props.auction)}>+{props.auction.step}</button>
        <button onClick={placeStepBid(2, props.auction)}>+{props.auction.step * 2}</button>
        <button onClick={placeStepBid(3, props.auction)}>+{props.auction.step * 3}</button>
        <input type="number" value={amount()} onInput={(e) => setAmount(parseInt(e.currentTarget.value))} min="0" step="1" />
        <button onClick={openConfirmBid()}>Enchérir</button>
      </div>
      <Show when={isConfirmBidOpen()}>
        <h1>Confirmation</h1>
        <p>Vous allez enchérir {amount()}€</p>
        <button onClick={confirmBid(amount(), props.auction)}>Confirmer</button>
        <button onClick={closeConfirmBid()}>Annuler</button>
      </Show>
    </div>
  );
};

export default Bid;
