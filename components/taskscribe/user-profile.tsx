'use Client'

import React from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

export default function UserProfile() {
    const session = useSession();

  return (
    <div>
      <Image src={session?.data?.user?.image} width={24} height={24} alt='user profile picture' className='rounded-full'/>
    </div>
  )
}
