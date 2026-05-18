"use client";

import { useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  CirclesFourIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { userContext } from "@/context/userContext";

const links = [
  { href: "/profile", label: "Account", icon: UserIcon },
  { href: "/profile/rentals", label: "My rentals", icon: ShoppingBagIcon },
  { href: "/profile/notifications", label: "Notifications", icon: BellIcon },
  {
    href: "/profile/dashboard",
    label: "Dashboard",
    icon: CirclesFourIcon,
    requiresAdmin: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { fullUserData } = useContext(userContext);

  return (
    <aside className="w-full max-w-60 bg-background">
      <nav className="flex flex-col divide-y deivide-contrast">
        {links
          .filter((link) => !link.requiresAdmin || fullUserData?.isAdmin)
          .map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex h-12 items-center gap-3 text-[15px] transition-colors px-6",
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
      </nav>
    </aside>
  );
}
