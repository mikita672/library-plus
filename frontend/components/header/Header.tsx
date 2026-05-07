import React from 'react'
import HeaderActions from './actions/Actions'
import Logo from './Logo'
import HeaderUser from './user/User'

function Header() {
  return (
    <div className="w-full flex items-center justify-between px-2 py-4 mb-2">
      <Logo />

      <div className="flex items-center justify-center gap-12">
        <HeaderActions />

        <HeaderUser />
      </div>
    </div>
  )
}

export default Header