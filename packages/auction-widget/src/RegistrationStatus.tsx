import { Component, Switch, Match, createMemo } from "solid-js";
import { AuctionType } from "@encheres-immo/widget-client/types";
import { useAuctionTimer } from "./hooks/useAuctionTimer.js";

/**
 * Display a message depending on the user's registration status for the auction.
 */
const RegistrationStatus: Component<{
  isLogged: () => boolean;
  auction: AuctionType;
}> = (props) => {
  const { isLogged, auction } = props;

  // Create a memo to track auction changes
  const auctionData = createMemo(() => auction);

  // Use the timer hook to properly handle time-based status changes
  const { isNotStarted, isInProgress } = useAuctionTimer(auctionData);

  return (
    <Switch>
      <Match
        when={
          isLogged() &&
          auction.registration &&
          auction.registration.isRegistrationAccepted &&
          !auction.registration.isParticipant &&
          isInProgress()
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
          isNotStarted()
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
          isNotStarted()
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
