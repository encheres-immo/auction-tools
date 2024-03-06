import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import client from './services/client';
import {AuctionType} from './types/types';

const ParticipateBox: Component<{setterIsLogged: any, isLogging: boolean, auction: AuctionType}> = (props) => {
  if(props.isLogging) {
    tryToConnect();
  }
  function connect(){
    return () => {
      // console.log("try to connect in return ")
      // const currentUrl = window.location.href;
      // const url = new URL(currentUrl);
      // url.searchParams.set('logging', 'true');
      // history.pushState({}, '', url.href);
      console.log("connect")
      tryToConnect();
    }
  }

  function tryToConnect(){ 
    client.authenticate().then( () => {
      props.setterIsLogged(true);
    });
  }
  
  const [isOpenBox, setIsOpenBox] = createSignal(false);
  const [isOpenAgentBox, setIsOpenAgentBox] = createSignal(false);
  return (
    <div>
      <button onClick={() => setIsOpenBox(!isOpenBox())}>Participer</button>
      {isOpenBox() && (
        <div>
          <h1>Participer</h1>
          <p>Connectez-vous pour participer à la vente aux enchères</p>
          <button onClick={connect()}>Se connecter</button>
          <button onClick={() => {setIsOpenAgentBox(true); setIsOpenBox(false);}}>Je veux participer</button>
          <button onClick={() => setIsOpenBox(false)}>Annuler</button>
        </div>
      )}
      {isOpenAgentBox() && (
        <div>
          <h1>Demande de participation</h1>
          <p>{props.auction.agentEmail}</p>
          <p>{props.auction.agentPhone}</p>
          <button onClick={() => setIsOpenAgentBox(false)}>Annuler</button>
        </div>
      )}
    </div>
  );
};

export default ParticipateBox;
