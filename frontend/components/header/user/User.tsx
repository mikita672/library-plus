"use client";

import React, { useContext } from 'react'
import HeaderLoginLink from './LoginLink';
import HeaderUserMenu from './UserMenu';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { userContext } from '@/context/userContext';

function HeaderUser() {
  const { isLoading, userData } = useContext(userContext);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Badge className="bg-card text-foreground h-8">
          <Spinner data-icon="inline-start" />
          <span>Loading</span>
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center cursor-pointer transition-colors hover:text-gray-400">
      {userData === null ?
        <HeaderLoginLink />
        : <HeaderUserMenu userData={userData} />
      }
    </div>
  )
}

export default HeaderUser