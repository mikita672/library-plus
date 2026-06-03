"use client";

import { useContext, useRef, useState } from "react";
import { userContext } from "@/context/userContext";
import { uploadUserAvatar } from "@/lib/api/media";
import { toast } from "sonner";
import EditProfilePopover from "./EditProfilePopover";
import Image from "next/image";

function UserInfo() {
  const { fullUserData, isLoading, refreshFullUser, refreshUser } = useContext(userContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (!fullUserData) return <div>No user data available</div>;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadUserAvatar(file);
      await Promise.all([refreshFullUser(), refreshUser()]);
      toast.success("Avatar updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const joinDate = fullUserData.joinedAt
    ? new Date(fullUserData.joinedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="p-2">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Account Info</h2>
        <EditProfilePopover
          currentName={fullUserData.name}
          currentPhone={fullUserData.phoneNumber}
          onSuccess={refreshFullUser}
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="group relative cursor-pointer" onClick={handleAvatarClick}>
          <div className="relative size-24 overflow-hidden rounded-full">
            <Image
              src={fullUserData.avatarUrl || "/images/user_placeholder.png"}
              alt="User Avatar"
              fill
              unoptimized={!!fullUserData.avatarUrl}
              className={`object-cover transition-opacity ${uploading ? "opacity-50" : "group-hover:opacity-75"}`}
            />
          </div>
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              ...
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="bg-black/50 px-2 py-1 text-[10px] text-white rounded">Change</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
        </div>
        <div className="flex flex-col">
          <h3>Name: {fullUserData.name || "N/A"}</h3>
          <h3>Email: {fullUserData.email}</h3>
          <h3>Phone number: {fullUserData.phoneNumber}</h3>
          <h3>Joined: {joinDate}</h3>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
