"use client";

import Link from 'next/link';
import { UserCircleIcon } from '@phosphor-icons/react';

function HeaderLoginLink() {
  return (
      <Link href="/login" className="flex gap-2 items-center">
        <UserCircleIcon className="h-8 w-8" />
        <span>Login</span>
      </Link>
  )
}

export default HeaderLoginLink