"use client";

import { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  CirclesFourIcon,
  HandCoinsIcon,
  BooksIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { userContext } from "@/context/userContext";

const links = [
  { href: "/profile", label: "Account", icon: UserIcon },
  { href: "/profile/rentals", label: "My rentals", icon: ShoppingBagIcon },
  { href: "/profile/notifications", label: "Notifications", icon: BellIcon },
];

const dashboardLinks = [
  {
    href: "/profile/dashboard/book-catalog",
    label: "Book Management",
    icon: BooksIcon,
  },
  {
    href: "/profile/dashboard/rentals",
    label: "Rentals and fines",
    icon: HandCoinsIcon,
  },
  {
    href: "/profile/dashboard/clients",
    label: "Client Management",
    icon: UserIcon,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { fullUserData } = useContext(userContext);
  const isAdmin = fullUserData?.isAdmin;
  const isDashboardActive = pathname.startsWith("/profile/dashboard");

  return (
    <aside className="w-full max-w-60 bg-background">
      <nav className="flex flex-col">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                  "flex h-12 items-center gap-3 border-b border-black px-6 text-[13px] whitespace-nowrap transition-colors last:border-b-0",
                active
                  ? "font-semibold text-primary hover:text-sidebar-foreground underline"
                  : "text-sidebar-foreground hover:text-primary",
              ].join(" ")}
            >
              <Icon size={20} weight={active ? "fill" : "regular"} />
              <span className="underline-offset-2">{label}</span>
            </Link>
          );
        })}

        {isAdmin ? (
          <div className="flex flex-col">
            <div
              aria-current={isDashboardActive ? "page" : undefined}
              className={[
                "flex h-12 items-center gap-3 border-b border-black px-6 text-[13px] whitespace-nowrap transition-colors",
                isDashboardActive
                  ? "font-semibold text-primary"
                  : "text-sidebar-foreground",
              ].join(" ")}
            >
              <CirclesFourIcon
                size={20}
                weight={isDashboardActive ? "fill" : "regular"}
              />
              <span>Dashboard</span>
            </div>

            <div className="flex flex-col">
              {dashboardLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex h-12 items-center gap-3 border-b border-black pl-12 pr-6 text-[13px] whitespace-nowrap transition-colors last:border-b-0",
                      active
                        ? "font-semibold text-primary"
                        : "text-sidebar-foreground hover:text-primary",
                    ].join(" ")}
                  >
                    <Icon size={20} weight={active ? "fill" : "regular"} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
