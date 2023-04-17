import React, { useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useSearchBox } from "react-instantsearch-hooks";

const Result = ({ result }: { result: any }) => {
  return (
    <>
      {result && (
        <FlatList
          data={result.prices}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }: { item: any }) => (
            <Link className="" href={`/seller/${result.sellerId}`} asChild>
              <Pressable>
                {() => (
                  <View className=" my-2 flex flex-col items-start">
                    <Image
                      className="mx-auto h-[30vh] max-h-full w-40 min-w-full max-w-xs rounded-lg object-cover object-center md:h-72  md:w-60 md:max-w-md"
                      alt="Picture f the "
                      placeholder={require("../../../assets/placeholder.png")}
                      source={result.Image[0].link}
                    />

                    <View className="mt-4 text-left text-xl font-bold text-gray-700">
                      <Text>{item.name} </Text>
                    </View>
                    <View className="text-md mt-1 font-medium text-gray-900">
                      <Text>${item.amount} </Text>
                    </View>
                  </View>
                )}
              </Pressable>
            </Link>
          )}
        />
      )}
    </>
  );
};

export default Result;
