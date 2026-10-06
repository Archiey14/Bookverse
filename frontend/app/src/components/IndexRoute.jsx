import { useSearchParams } from "react-router-dom";
import App from "../App";
import LandingPage from "../pages/LandingPage";
import { useAuth } from "../hooks/useAuth";

function IndexRoute() {
  const { isLoggedIn } = useAuth();
  const [params] = useSearchParams();
  const hasBrowseQuery =
    params.has("collection") || params.has("category") || params.has("q");

  // Show storefront if logged in or actively filtering/searching, otherwise show Landing Page
  if (isLoggedIn || hasBrowseQuery) {
    return <App />;
  }

  return <LandingPage />;
}

export default IndexRoute;
