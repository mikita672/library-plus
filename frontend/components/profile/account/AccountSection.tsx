import type { ReactNode } from "react";

type AccountSectionProps = {
  children: ReactNode;
  className?: string;
};

function AccountSection({ children }: AccountSectionProps) {
  return <div className={`p-2`}>{children}</div>;
}

export default AccountSection;
