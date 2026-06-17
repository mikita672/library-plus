"use client"

import React, { useContext } from 'react'
import { UserData } from '@/types/user/UserData';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import HeaderUserMenuAvatar from './UserMenuAvatar';
import { BellIcon, BooksIcon, CirclesFourIcon, HandCoinsIcon, ShoppingBagIcon, SignOutIcon, UserCircleIcon, UserIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { userContext } from '@/context/userContext';

interface Props {
  userData: UserData;
}

function HeaderUserMenu({ userData }: Props) {
  const router = useRouter();
  const { logout, fullUserData } = useContext(userContext);
  const isAdmin = fullUserData?.isAdmin;

  const onLogout = async () => {
    const error = await logout();
    if (error === null) {
        toast.success("Logged out successfully");
      router.push('/login');
    } else {
      toast.error("Failed to logout", {
        description: `Reason: ${error}`,
      });
    }
  }

  let username = userData.name ?? userData.email;
  if (username.length > 12) {
      username = username.substring(0, 12) + '...';
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className="flex gap-2 items-center cursor-pointer transition-colors hover:text-gray-400 outline-none">
          <HeaderUserMenuAvatar avatarUrl={userData.avatarUrl} />
          <span>{username}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-50">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href="/profile" className="flex flex-1 gap-2 align-center w-full">
              <UserIcon className="w-6 h-6" />
              <span>Account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href="/profile/rentals" className="flex flex-1 gap-2 align-center w-full">
              <ShoppingBagIcon className="w-6 h-6" />
              <span>My rentals</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href="/profile/notifications" className="flex flex-1 gap-2 align-center w-full">
              <BellIcon className="w-6 h-6" />
              <span>Notifications</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/profile/dashboard" className="flex flex-1 gap-2 align-center w-full">
                  <CirclesFourIcon className="w-6 h-6" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/profile/dashboard/book-catalog" className="flex flex-1 gap-2 align-center w-full">
                  <BooksIcon className="w-6 h-6" />
                  <span>Book Management</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/profile/dashboard/rentals" className="flex flex-1 gap-2 align-center w-full">
                  <HandCoinsIcon className="w-6 h-6" />
                  <span>Rentals and fines</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/profile/dashboard/clients" className="flex flex-1 gap-2 align-center w-full">
                  <UserIcon className="w-6 h-6" />
                  <span>Client Management</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <div onClick={onLogout} className="flex flex-1 gap-2 align-center w-full">
            <SignOutIcon className="w-6 h-6" />
            <span>Logout</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderUserMenu