import { oauthProviderList } from "@/features/identity/server";
import { LoginPanel } from "./_components/login-panel";

export default async function LoginPage() {
  return <LoginPanel providers={oauthProviderList()} />;
}
