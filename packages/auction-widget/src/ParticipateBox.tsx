import type { Accessor, Component, Setter } from "solid-js";
import { createSignal, Show } from "solid-js";
import client from "@encheres-immo/widget-client";
import {
  AuctionType,
  PropertyInfoType,
  UserType,
} from "@encheres-immo/widget-client/types";
import CenteredModal from "./CenteredModal.js";
import { Icon } from "./Spritesheet.jsx";

/**
 * Render the participate button, and different modals allowing the user to connect, register to the auction,
 * or contact the agent (depending on the user's status and the auction's registration status).
 */
const ParticipateBox: Component<{
  auction: AuctionType;
  propertyInfo: PropertyInfoType;
  isLogged: Accessor<boolean>;
  isLogging: Accessor<boolean>;
  setAuction: (auction: AuctionType) => void;
  updateUser: (user: UserType, propertyInfo: PropertyInfoType) => void;
  allowUserRegistration: Boolean;
  tosUrl: string;
}> = (props) => {
  // If we are in the OAuth registration process, try to connect the user.
  if (props.isLogging()) {
    tryToConnect();
  }

  /**
   * Try to connect the user to the API and retrieve its informations.
   */
  function tryToConnect() {
    (client.authenticate() as Promise<void>).then(() => {
      client.me().then((user) => {
        if (user) {
          props.updateUser(user, props.propertyInfo);
        }
      });
    });
  }

  /**
   * Try to register the user to the auction and refresh the auction informations.
   * If the registration is successful, emit a custom event to notify the parent component.
   */
  function registerUserToAuction() {
    client.registerUserToAuction(props.auction.id).then((auction) => {
      emitRegisterEvent();
      props.setAuction(auction);
    });
  }

  /**
   * Emit a custom event to notify the parent component that the user has registered to the auction.
   * Can be used for tracking purposes or to display a success notification.
   */
  function emitRegisterEvent() {
    const event = new CustomEvent("auction-widget:register", {});
    document.getElementById("auction-widget")?.dispatchEvent(event);
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
        <CenteredModal title="Vous devez être connecté" icon="user-lock">
          <div class="auction-widget-action">
            <button
              class="auction-widget-btn auction-widget-custom"
              onClick={() => {
                tryToConnect();
                setOpenModal(false);
              }}
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
        <CenteredModal title="Demande de participation" icon="gavel">
          En cliquant sur Valider, je reconnais avoir lu et accepté{" "}
          <a
            href={
              props.tosUrl == ""
                ? "https://encheres-immo.com/cgu"
                : props.tosUrl
            }
            target="_blank"
          >
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
        <CenteredModal title="Demande de participation" icon="gavel">
          <div
            class="auction-widget-contact"
            data-testid="auction-widget-contact"
          >
            <a
              href={"mailto:" + props.auction.agentEmail}
              class="auction-widget-btn auction-widget-custom"
            >
              <Icon name="envelope" />
              {props.auction.agentEmail}
            </a>
            <a
              href={"tel:" + props.auction.agentPhone}
              class="auction-widget-btn auction-widget-custom"
            >
              <Icon name="phone" />
              {props.auction.agentPhone}
            </a>
          </div>
          <div class="auction-widget-action">
            <button
              class="auction-widget-btn"
              onClick={() => {
                setIsContactModalOpen(false);
                setOpenModal(false);
              }}
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
