import FAQSection from '@/components/home/FAQ/FAQSection'
import GreetingSection from '@/components/home/GreetingSection'
import HowDoWeOperateSecton from '@/components/home/howDoWeOperate/HowDoWeOperateSecton'
import TrendingSection from '@/components/home/TrendingSection'
import React from 'react'

function page() {
  return (
    <div className="w-full min-h-full flex flex-col gap-36 bg-card pb-10">
      <GreetingSection />

      <TrendingSection />

      <HowDoWeOperateSecton />

      <FAQSection />

    </div>
  )
}

export default page