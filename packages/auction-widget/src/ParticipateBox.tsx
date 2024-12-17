import type { Component, Setter } from "solid-js";
import { createSignal, Show } from "solid-js";
import client from "@encheres-immo/widget-client";
import { AuctionType } from "@encheres-immo/widget-client/types";
import CenteredModal from "./CenteredModal.js";

/**
 * Render the participate button, and different modals allowing the user to connect, register to the auction,
 * or contact the agent (depending on the user's status and the auction's registration status).
 */
const ParticipateBox: Component<{
  updateUser: any;
  auction: AuctionType;
  setAuction: (auction: AuctionType) => void;
  isLogged: () => boolean;
  setIsLogged: Setter<boolean>;
  isLogging: () => boolean;
  allowUserRegistration: Boolean;
  tosUrl: string;
}> = (props) => {
  if (props.isLogging()) {
    tryToConnect();
  }

  function connect() {
    return () => {
      tryToConnect();
    };
  }

  function tryToConnect() {
    client.authenticate().then(() => {
      props.setIsLogged(true);
      client.me().then((user) => {
        props.updateUser(user);
      });
    });
  }

  function registerUserToAuction() {
    client.registerUserToAuction(props.auction.id).then((auction) => {
      props.setAuction(auction);
    });
  }

  const [isModalOpen, setOpenModal] = createSignal(false);
  const [isContactModalOpen, setIsContactModalOpen] = createSignal(false);

  return (
    <Show when={!props.isLogged() || !props.auction.registration}>
      <div class="auction-widget-section">
        <button
          class="auction-widget-btn auction-widget-custom"
          onClick={() => setOpenModal(true)}
        >
          Je veux participer
        </button>
      </div>

      <Show when={isModalOpen() && !props.isLogged()}>
        <CenteredModal
          title="Vous devez être connecté"
          icon_class="fas fa-user-lock"
          success={false}
        >
          <div class="auction-widget-action">
            <button
              class="auction-widget-btn auction-widget-custom"
              onClick={connect()}
            >
              Se connecter
            </button>
            <button
              class="auction-widget-btn"
              onClick={() => setOpenModal(false)}
            >
              Annuler
            </button>
          </div>
          <div id="auction-widget-agent-link">
            <p class="auction-widget-modal-note">Pas encore de compte ?</p>
            <button
              id="auction-widget-link"
              onClick={() => {
                setIsContactModalOpen(true);
                setOpenModal(false);
              }}
            >
              Contacter l'agent
            </button>
          </div>
        </CenteredModal>
      </Show>

      <Show
        when={
          isModalOpen() &&
          props.isLogged() &&
          !props.auction.registration &&
          props.allowUserRegistration
        }
      >
        <CenteredModal
          title="Demande de participation"
          success={false}
          icon_class="fas fa-gavel"
        >
          En cliquant sur Valider, je reconnais avoir lu et accepté{" "}
          <a href={props.tosUrl == "" ? "https://encheres-immo.com/cgu" : props.tosUrl}
            target="_blank">
            les conditions générales d'utilisation
          </a>
          .
          <div class="auction-widget-action">
            <button
              class="auction-widget-btn auction-widget-custom"
              onClick={() => {
                registerUserToAuction();
                setOpenModal(false);
              }}
            >
              Valider
            </button>
            <button
              class="auction-widget-btn"
              onClick={() => setOpenModal(false)}
            >
              Annuler
            </button>
          </div>
        </CenteredModal>
      </Show>

      <Show
        when={
          (isModalOpen() &&
            props.isLogged() &&
            !props.auction.registration &&
            !props.allowUserRegistration) ||
          isContactModalOpen()
        }
      >
        <CenteredModal
          title="Demande de participation"
          icon_class="fas fa-gavel"
          success={false}
        >
          <div class="auction-widget-contact">
            <a
              href={"mailto:" + props.auction.agentEmail}
              class="auction-widget-btn auction-widget-custom"
            >
              <i class="fas fa-envelope"></i>
              {props.auction.agentEmail}
            </a>
            <a
              href={"tel:" + props.auction.agentPhone}
              class="auction-widget-btn auction-widget-custom"
            >
              <i class="fas fa-phone"></i>
              {props.auction.agentPhone}
            </a>
          </div>
          <div class="auction-widget-action">
            <button
              class="auction-widget-btn"
              onClick={() =>
                setIsContactModalOpen(false) && setOpenModal(false)
              }
            >
              Fermer
            </button>
          </div>
        </CenteredModal>
      </Show>
    </Show>
  );
};

export default ParticipateBox;
