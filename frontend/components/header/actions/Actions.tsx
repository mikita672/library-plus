"use client";

import { BasketIcon } from '@phosphor-icons/react'
import HeaderActionThemeToggle from './ThemeToggle';
import HeaderNotifications from './notifications/Nofications';
import { useContext } from 'react';
import { userContext } from '@/context/userContext';

function HeaderActions() {
  const { isLoading, userData } = useContext(userContext);

  return (
    <div className="flex gap-5">
      {(isLoading || userData === null) ? <div className="w-6 h-6" /> : <HeaderNotifications />}

      <div title="Your cart">
        <BasketIcon className="w-6 h-6 text-foreground cursor-pointer transition-colors hover:text-gray-400" />
      </div>

      <HeaderActionThemeToggle />
    </div>
  )
}

export default HeaderActions