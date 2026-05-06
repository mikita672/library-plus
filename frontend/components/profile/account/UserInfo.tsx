"use client";

import { useContext } from "react";
import EditButton from "./EditButton";
import { userContext } from "@/context/userContext";
import ChangePhonePopover from "./ChangePhoneModal";

function UserInfo() {
  const { fullUserData, isLoading, refreshFullUser } = useContext(userContext);

  if (isLoading) return <div>Loading...</div>;
  if (!fullUserData) return <div>No user data available</div>;

  let joinDate = fullUserData.joinedAt
    ? new Date(fullUserData.joinedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Account Info</h2>
        <ChangePhonePopover
          phoneNumber={fullUserData.phoneNumber}
          onSuccess={refreshFullUser}
        />
      </div>
      <div className="flex items-center gap-4">
        <img
          src={fullUserData.avatarUrl || "/images/Smileys.jpg"}
          alt="User Avatar"
          className="size-24 rounded-full"
        />
        <div className="flex flex-col">
          <h3>Email: {fullUserData.email}</h3>
          <h3>Phone number: {fullUserData.phoneNumber}</h3>
          <h3>Joined: {joinDate}</h3>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
