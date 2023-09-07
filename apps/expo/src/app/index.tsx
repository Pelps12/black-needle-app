import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import SearchWrapper from "../components/Search/Wrapper";
import SKTest from "../components/Utils/SKText";

const Index = () => {
  const { isSignedIn, isLoaded } = useAuth();
  useEffect(() => {
    if (isSignedIn) {
      router.replace("/home");
    }
  }, [isSignedIn]);

  if (!isLoaded) {
    return null;
  }
  return (
    <View className="-z-50 mt-0 bg-[##F2F2F2] pt-0">
      <SearchWrapper />
    </View>
  );
};

export default Index;
