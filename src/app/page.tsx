import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const hasRefreshToken = cookieStore.has("refresh_token");

  if (hasRefreshToken) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
