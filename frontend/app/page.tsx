import FAQSection from '@/components/home/FAQ/FAQSection'
import GreetingSection from '@/components/home/GreetingSection'
import HowDoWeOperateSecton from '@/components/home/howDoWeOperate/HowDoWeOperateSecton'
import TrendingBooks from '@/components/home/TrendingBooks'
import React from 'react'

function page() {
  return (
    <div className="w-full min-h-full flex flex-col gap-36 bg-card pb-10">
      <GreetingSection />

      <TrendingBooks />

      <HowDoWeOperateSecton />

      <FAQSection />
    </div>
  )
}

export default page