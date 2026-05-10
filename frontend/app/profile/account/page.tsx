"use client";

import ChangePassword from "@/components/profile/account/ChangePassword";
import DangerZone from "@/components/profile/account/DangerZone";
import DeliveryAddress from "@/components/profile/account/DeliveryAddress";
import AccountSection from "@/components/profile/account/AccountSection";
import UserInfo from "@/components/profile/account/UserInfo";
import { userContext } from "@/context/userContext";
import React, { useContext, useEffect } from "react";

function page() {
  const { refreshFullUser } = useContext(userContext);

  useEffect(() => {
    refreshFullUser();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-8">
      <AccountSection>
        <UserInfo />
      </AccountSection>
      <AccountSection>
        <DeliveryAddress />
      </AccountSection>
      <AccountSection>
        <ChangePassword />
      </AccountSection>
      <AccountSection>
        <DangerZone />
      </AccountSection>
    </div>
  );
}

export default page;
