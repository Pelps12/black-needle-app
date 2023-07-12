import { useAuth } from '@clerk/clerk-expo'
import { Link} from 'expo-router'
import { LinkProps } from 'expo-router/build/link/Link'
import React from 'react'

const ProtectedLink: React.FC<LinkProps> = ({href, children,className}) => {
  const {isSignedIn, isLoaded} = useAuth();
  return (
    <Link href={isSignedIn ? href : "/auth/signin"} className={className} disabled={!isLoaded}>{children}</Link>
  )
}

export default ProtectedLink