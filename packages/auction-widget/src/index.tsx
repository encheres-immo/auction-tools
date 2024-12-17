/* @refresh reload */
import { render } from "solid-js/web";
import { is_valid_url } from "./utils.js";
import App from "./App.jsx";

const root = document.getElementById("auction-widget");

const apiKey = root?.getAttribute("api-key") || "";
const environment = (root?.getAttribute("api-env") || "production") as "local" | "staging" | "production";

const propertyId = root?.getAttribute("property-id") || "";
const source = root?.getAttribute("source") || "";
const sourceAgencyId = root?.getAttribute("source-agency-id") || "";
const sourceId = root?.getAttribute("source-id") || "";

const allowUserRegistration = root?.getAttribute("allow-user-registration") === "true";
const tosUrl = root?.getAttribute("tos-url") || "";

if (!(root instanceof HTMLElement)) {
  throw new Error(
    "Auction widget: No root element found with id 'auction-widget'. Did you forget to add it? Or maybe the id attribute got misspelled?"
  );
}
if (apiKey == "") {
  throw new Error(
    "Auction widget: No 'api-key' attribute found. Did you forget to add it? Or maybe the attribute got misspelled?"
  );
}
if (propertyId == "" && (source == "" || sourceAgencyId == "" || sourceId == "")) {
  throw new Error(
    "Auction widget: Either 'property-id' or 'source', 'source-agency-id', and 'source-id' must be provided. Did you forget to add them? Or maybe the attributes got misspelled?"
  );
}
if (tosUrl != "" && !is_valid_url(tosUrl)) {
  throw new Error(
    "Auction widget: 'tos-url' is not a valid URL."
  );
}

const propertyInfo = propertyId ? { propertyId } : {
  source,
  sourceAgencyId,
  sourceId,
};

render(
  () => (
    <App apiKey={apiKey} propertyInfo={propertyInfo} environment={environment} allowUserRegistration={allowUserRegistration} tosUrl={tosUrl}/>
  ),
  root!
);
