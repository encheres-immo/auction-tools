import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import client from "@encheres-immo/widget-client";
import { AuctionType } from "@encheres-immo/widget-client/types";
import CenteredModal from "./CenteredModal.js";

const ParticipateBox: Component<{
  setterIsLogged: any;
  updateUser: any;
  isLogging: boolean;
  auction: AuctionType;
}> = (props) => {
  if (props.isLogging) {
    tryToConnect();
  }
  function connect() {
    return () => {
      // console.log("try to connect in return ")
      // const currentUrl = window.location.href;
      // const url = new URL(currentUrl);
      // url.searchParams.set('logging', 'true');
      // history.pushState({}, '', url.href);
      console.log("connect");
      tryToConnect();
    };
  }

  function tryToConnect() {
    client.authenticate().then(() => {
      props.setterIsLogged(true);
      client.me().then((user) => {
        props.updateUser(user);
      });
    });
  }

  const [isOpenBox, setIsOpenBox] = createSignal(false);
  const [isOpenAgentBox, setIsOpenAgentBox] = createSignal(false);
  return (
    <div>
      <div class="auction-widget-section">
        <button
          class="auction-widget-btn auction-widget-custom auction-widget-full"
          onClick={() => setIsOpenBox(!isOpenBox())}
        >
          Je veux participer
        </button>
      </div>
      {isOpenBox() && (
        <div>
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
                class="auction-widget-btn auction-widget-custom"
                onClick={() => {
                  setIsOpenAgentBox(true);
                  setIsOpenBox(false);
                }}
              >
                Contacter l'agent
              </button>
              <button
                class="auction-widget-btn"
                onClick={() => setIsOpenBox(false)}
              >
                Annuler
              </button>
            </div>
          </CenteredModal>
        </div>
      )}
      {isOpenAgentBox() && (
        <CenteredModal
          title="Demande de participation"
          icon_class={"fas fa-gavel"}
          success={false}
        >
          <div class="auction-widget-action">
            <a
              class="auction-widget-btn auction-widget-custom"
              href={"mailto:" + props.auction.agentEmail}
            >
              <i class="fas fa-envelope"></i>
              {props.auction.agentEmail}
            </a>
            <a
              class="auction-widget-btn auction-widget-custom"
              href={"tel:" + props.auction.agentPhone}
            >
              <i class="fas fa-phone"></i>
              {props.auction.agentPhone}
            </a>
            <button
              class="auction-widget-btn"
              onClick={() => setIsOpenAgentBox(false)}
            >
              Annuler
            </button>
          </div>
        </CenteredModal>
      )}
    </div>
  );
};

export default ParticipateBox;
