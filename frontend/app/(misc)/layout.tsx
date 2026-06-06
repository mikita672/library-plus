import React from 'react'

function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-[70vh] px-7">
            {children}
        </div>
    )
}

export default layout