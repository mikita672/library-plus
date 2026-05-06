import React from 'react'

interface Props {
  sequentialNumber: number;
  title: string;
  text: string;
  icon: React.ReactNode;
}

function InformationCard({ sequentialNumber, title, text, icon }: Props) {
  return (
    <div className="w-72 min-h-64 p-6 bg-background flex flex-col gap-6">
      <div className="flex w-full justify-between items-end">
      <span className="text-6xl font-bold text-primary">{sequentialNumber}</span>

      {icon}
      </div>

      <div>
        <p className="text-lg font-bold">{title}</p>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default InformationCard