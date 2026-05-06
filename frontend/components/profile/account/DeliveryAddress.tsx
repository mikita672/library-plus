"use client";

import { useContext } from "react";
import { userContext } from "@/context/userContext";
import ChangeAddressPopover from "./ChangeAddressPopover";

function DeliveryAddress() {
  const { fullUserData, refreshFullUser } = useContext(userContext);

  if (!fullUserData) return <div>Loading...</div>;

  const address = fullUserData.address;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Preferred delivery address</h2>
        <ChangeAddressPopover address={address} onSuccess={refreshFullUser} />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex flex-col text-base">
          <div className="inline-flex gap-6 mb-2">
            <h4>City: {address.city || "Not provided"}</h4>
            <h4>Street: {address.street || "Not provided"}</h4>
            <h4>Building number: {address.buildingNumber || "Not provided"}</h4>
          </div>
          <h4>Post code: {address.postalCode || "Not provided"}</h4>
        </div>
      </div>
    </div>
  );
}

export default DeliveryAddress;
