import { getSession } from "@/lib/auth";
import NavClient from "./NavClient";
import PublicNav from "./PublicNav";

export default async function Nav() {
  const session = await getSession();
  if (!session) return <PublicNav />;

  const links = [
    { href: "/owner", label: "Dashboard" },
    { href: "/products", label: "Products" },
    { href: "/owner/activity", label: "Activity" },
    { href: "/owner/settings", label: "Settings" },
  ];

  return <NavClient session={session} links={links} />;
}
