/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App.jsx";
/**
 * This is the entry point of the widget. It will render the App component into the root element with id 'auction-widget',
 * and pass the apiKey and propertyId as props. Throws an error if the root element is not found.
 */
const root = document.getElementById("auction-widget");
// Get params from root element attributes
const apiKey = root?.getAttribute("api-key") || "";
const propertyId = root?.getAttribute("property-id") || "";

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
if (propertyId == "") {
  throw new Error(
    "Auction widget: No 'property-id' attribute found. Did you forget to add it? Or maybe the attribute got misspelled?"
  );
}

render(() => <App apiKey={apiKey} propertyId={propertyId} />, root!);
