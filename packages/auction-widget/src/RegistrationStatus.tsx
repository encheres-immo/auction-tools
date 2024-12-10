import { Component, Switch, Match } from "solid-js";
import { isAuctionInProgress, isAuctionNotStarted } from "./utils.js";
import Bid from "./Bid.js";
import { AuctionType } from "@encheres-immo/widget-client/types";

const RegistrationStatus: Component<{
  isLogged: () => boolean;
  auction: AuctionType;
}> = (props) => {
  const { isLogged, auction } = props;

  return (
    <Switch>
      <Match
        when={
          isLogged() &&
          auction.registration &&
          auction.registration.isRegistrationAccepted &&
          auction.registration.isParticipant &&
          isAuctionInProgress(auction)
        }
      >
        <Bid auction={auction} />
      </Match>
      <Match
        when={
          isLogged() &&
          auction.registration &&
          auction.registration.isRegistrationAccepted &&
          !auction.registration.isParticipant &&
          isAuctionInProgress(auction)
        }
      >
        <p class="auction-widget-note">
          Vous êtes observateur pour cette vente. Vous ne pouvez pas enchérir.
        </p>
      </Match>
      <Match
        when={
          isLogged() &&
          auction.registration &&
          auction.registration.isRegistrationAccepted &&
          !auction.registration.isParticipant &&
          isAuctionNotStarted(auction)
        }
      >
        <p class="auction-widget-note">
          Votre demande d'observation pour cette vente a été acceptée. Attendez
          le début de l'enchère pour voir les participations.
        </p>
      </Match>
      <Match
        when={
          isLogged() &&
          auction.registration &&
          auction.registration.isRegistrationAccepted === true &&
          isAuctionNotStarted(auction)
        }
      >
        <p class="auction-widget-note">
          Votre demande de participation pour cette vente a été acceptée.
          Attendez le début de l'enchère pour enchérir.
        </p>
      </Match>
      <Match
        when={
          isLogged() &&
          auction.registration &&
          auction.registration.isRegistrationAccepted === false
        }
      >
        <p class="auction-widget-note">
          Votre demande de participation pour cette vente a été refusée.
        </p>
      </Match>
      <Match
        when={
          isLogged() &&
          auction.registration &&
          auction.registration.isRegistrationAccepted == null
        }
      >
        <p class="auction-widget-note">
          Votre demande de participation a été transmise à l'agent responsable
          du bien. Vous serez informé par email lorsqu'elle sera validée.
        </p>
      </Match>
    </Switch>
  );
};

export default RegistrationStatus;
