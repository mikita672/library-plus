"use client";

import { BasketIcon } from '@phosphor-icons/react'
import HeaderActionThemeToggle from './ThemeToggle';
import HeaderNotifications from './notifications/Nofications';
import { useContext } from 'react';
import { userContext } from '@/context/userContext';
import Cart from './cart/Cart';

function HeaderActions() {
  const { isLoading, userData } = useContext(userContext);

  return (
    <div className="flex gap-5">
      {(isLoading || userData === null) ? <div className="w-6 h-6" /> : <HeaderNotifications />}

      <Cart />

      <HeaderActionThemeToggle />
    </div>
  )
}

export default HeaderActions