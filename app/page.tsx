import { redirect } from "next/navigation";

export default function Home() {
  // Редирект на новый URL входа с параметрами
  const returnUrl = encodeURIComponent(
    "/connect/authorize/callback?client_id=single_spa_prod_client&redirect_uri=https%3A%2F%2Fapp.centraldispatch.com%2Foidc-callback&response_type=code&scope=openid%20listings_search%20user_management_bff&state=bc496d547f4e4359a68843d7bc92070c&code_challenge=uhHtytwFkuuEc0GOAOSar2lmjDJtlW_o2-ViajUPEds&code_challenge_method=S256&response_mode=query"
  );
  redirect(`/Account/Login?ReturnUrl=${returnUrl}`);
}





