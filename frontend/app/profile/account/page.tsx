import ChangePassword from "@/components/profile/account/ChangePassword";
import DangerZone from "@/components/profile/account/DangerZone";
import DeliveryAddress from "@/components/profile/account/DeliveryAddress";
import UserInfo from "@/components/profile/account/UserInfo";
import React from "react";

function page() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="p-2">
        <UserInfo />
      </div>
      <div className=" p-2">
        <DeliveryAddress />
      </div>
      <div className=" p-2">
        <ChangePassword />
      </div>
      <div className="p-2">
        <DangerZone />
      </div>
    </div>
  );
}

export default page;
