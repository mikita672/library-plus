"use client"

import { UserCircleIcon } from '@phosphor-icons/react';
import React from 'react'

interface Props {
    avatarUrl: string | null;
}

function HeaderUserMenuAvatar({ avatarUrl } : Props) {
  return avatarUrl === null ?
    <UserCircleIcon className="h-8 w-8" /> :
    <img className="h-8 w-8 rounded-full" src={avatarUrl} />
}

export default HeaderUserMenuAvatar;