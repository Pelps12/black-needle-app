import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router';
import React from 'react'

const RouteProtector= ({children}: {children: React.ReactNode}) => {
    const {isSignedIn} = useAuth();
    const router = useRouter();
    return (
        <>
        <SignedIn>
            {children}
        </SignedIn>
        <SignedOut>
        <SignedOut>
        <Stack.Navigator initialRouteName="signin">
          <Stack.Screen
            name="signin"
            component={Login}
            options={{ title: "Login" }}
          />
          <Stack.Screen
            name="signup"
            component={SignUp}
            options={{ title: "Register" }}
          />
        </Stack.Navigator>

        {/* <SignInSignUpScreen /> */}
      </SignedOut>
        </SignedOut>
        </>
    )
}

export default RouteProtector