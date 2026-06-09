"use client"

import { UserCircleIcon } from '@phosphor-icons/react';
import React from 'react'
import Image from "next/image";

interface Props {
    avatarUrl: string | null;
}

function HeaderUserMenuAvatar({ avatarUrl } : Props) {
  return avatarUrl === null ?
    <UserCircleIcon className="h-8 w-8" /> :
    <div className="relative h-8 w-8 overflow-hidden rounded-full">
      <Image src={avatarUrl} alt="User avatar" fill sizes="32px" className="object-cover" unoptimized />
    </div>
}

export default HeaderUserMenuAvatar;