"use client";

import ChangePassword from "@/components/profile/account/ChangePassword";
import DangerZone from "@/components/profile/account/DangerZone";
import UserInfo from "@/components/profile/account/UserInfo";
import React from "react";

function ProfilePage() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="flex flex-col gap-8">
        <UserInfo />
        <DangerZone />
      </div>
      <ChangePassword />
    </div>
  );
}

export default ProfilePage;
