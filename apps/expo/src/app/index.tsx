import React from "react";
import { Text, View } from "react-native";

import SearchWrapper from "../components/Search/Wrapper";
import SKTest from "../components/Utils/SKText";

const Index = () => {
  return (
    <View className="mt-0 bg-[##F2F2F2] pt-0">
      <SKTest fontWeight="semi-bold" className="mx-4 text-4xl font-bold">
        Home
      </SKTest>
      <SearchWrapper />
    </View>
  );
};

export default Index;
