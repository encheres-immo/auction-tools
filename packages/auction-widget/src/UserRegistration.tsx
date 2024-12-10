import type { Component } from "solid-js";
import { Show, Switch, Match } from "solid-js";
import {
  AuctionType,
} from "@encheres-immo/widget-client/types";
import CenteredModal from "./CenteredModal.jsx";
import client from "@encheres-immo/widget-client";

function registerUserToAuction(auction: AuctionType, setAuction: (auction: AuctionType) => void) {
  client.registerUserToAuction(auction.id).then((auction) => {
    setAuction(auction);
  });
}
/**
 * Display user registration modal.
 */
const UserRegistration: Component<{
  allowUserRegistration: boolean;
  setAuction: (auction: AuctionType) => void;
  auction: AuctionType;
  setIsShowRegisterUser: (value: boolean) => void;
  isShowRegisterUser: () => boolean;
  tosUrl: string;
}> = (props: any) => {
  return (
    <Switch>
      <Match when={props.allowUserRegistration}>
        <button
          class="auction-widget-btn auction-widget-custom"
          onClick={() => props.setIsShowRegisterUser(true)}
        >
          Je veux participer
        </button>
        <Show when={props.isShowRegisterUser()}>
          <CenteredModal
            title="Demande de participation"
            success={false}
            icon_class="fas fa-gavel"
          >
            En cliquant sur Valider, je reconnais avoir lu et accepté <a href={props.tosUrl} target="_blank">les conditions générales d'utilisation</a>.
            <div class="auction-widget-action">
              <button
                class="auction-widget-btn auction-widget-custom"
                onClick={() => registerUserToAuction(props.auction, props.setAuction)}
              >
                Valider
              </button>
              <button class="auction-widget-btn" onClick={() => props.setIsShowRegisterUser(false)}>
                Annuler
              </button>
            </div>
          </CenteredModal>
        </Show>
      </Match>
      <Match when={!props.allowUserRegistration}>
        <p class="auction-widget-note">
            Vous n'êtes pas inscrit à cette vente, veuillez contacter
            l'agent responsable.
        </p>
      </Match>
    </Switch>
  );
};

export default UserRegistration;
