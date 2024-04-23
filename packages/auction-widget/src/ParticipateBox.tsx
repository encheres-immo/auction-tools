import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import client from "./services/client";
import { AuctionType } from "./types/types";
import CenteredModal from "./CenteredModal";

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
      <div class="p-4">
        <button
          class="bg-secondary border-secondary active:ring-secondary group inline-flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-medium leading-5 text-white hover:bg-opacity-80 active:ring-2"
          onClick={() => setIsOpenBox(!isOpenBox())}
        >
          Je veux participer
        </button>
      </div>
      {isOpenBox() && (
        <div>
          <CenteredModal
            title="Vous devez être connecté"
            icon_class="fas fa-user-shield text-secondary text-lg"
            icon_bg_class="bg-secondary bg-opacity-25"
            success={false}
          >
            <div class="mt-5 flex flex-col space-y-2 sm:mt-6">
              <button
                class="bg-secondary border-secondary active:ring-secondary group inline-flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-medium leading-5 text-white hover:bg-opacity-80 active:ring-2"
                onClick={connect()}
              >
                Se connecter
              </button>
              <button
                class="bg-secondary border-secondary active:ring-secondary group inline-flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-medium leading-5 text-white hover:bg-opacity-80 active:ring-2"
                onClick={() => {
                  setIsOpenAgentBox(true);
                  setIsOpenBox(false);
                }}
              >
                Je veux participer
              </button>
              <button
                class="group inline-flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium leading-5 hover:bg-gray-50"
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
          icon_bg_class={"bg-secondary bg-opacity-25"}
          icon_class={"fad fa-gavel text-secondary text-2xl"}
          success={false}
        >
          <div class="mt-6 grid grid-cols-1 gap-2">
            <a
              class="bg-secondary border-secondary active:ring-secondary group inline-flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-medium leading-5 text-white hover:bg-opacity-80 active:ring-2"
              href={"mailto:" + props.auction.agentEmail}
            >
              <i class="fas fa-envelope mr-2"></i>
              {props.auction.agentEmail}
            </a>
            <a
              class="bg-secondary border-secondary active:ring-secondary group inline-flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border px-3 py-2 text-sm font-medium leading-5 text-white hover:bg-opacity-80 active:ring-2"
              href={"tel:" + props.auction.agentPhone}
            >
              <i class="fas fa-phone mr-2"></i>
              {props.auction.agentPhone}
            </a>
            <button
              class="group inline-flex w-full cursor-pointer items-center justify-center gap-x-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium leading-5 hover:bg-gray-50"
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
