/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.jsx";

const root = document.getElementById("auction-widget");

const apiKey = root?.getAttribute("api-key") || "";
const environment = root?.getAttribute("api-env") || "production";

const propertyId = root?.getAttribute("property-id") || "";
const source = root?.getAttribute("source") || "";
const sourceAgencyId = root?.getAttribute("source-agency-id") || "";
const sourceId = root?.getAttribute("source-id") || "";

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

const propertyInfo = propertyId ? { propertyId } : {
  source,
  sourceAgencyId,
  sourceId,
};

render(
  () => (
    <App apiKey={apiKey} propertyInfo={propertyInfo} environment={environment} />
  ),
  root!
);
