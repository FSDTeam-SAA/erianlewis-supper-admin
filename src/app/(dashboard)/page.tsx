import React from 'react'
import CommendCenter from './_components/CommendCenter'
import AbandonedSignups from './_components/AbandonedSignups'
import RecentPlatformActivity from './_components/RecentPlatformActivity'

function page() {
  return (
    <div className='container mx-auto'>
      <CommendCenter />
      <AbandonedSignups />
      <RecentPlatformActivity />
    </div>
  )
}

export default page