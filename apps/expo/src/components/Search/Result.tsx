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

import ImageWithFallback from "../../components/Utils/ImageWithFallback";
import SKText from "../../components/Utils/SKText";

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
                  <View className=" my-2 flex flex-col items-start ">
                    <ImageWithFallback
                      className="mx-auto h-[30vh] max-h-full w-32 min-w-full max-w-xs rounded-lg object-cover object-center md:h-72  md:w-60 md:max-w-md"
                      placeholder={require("../../../assets/placeholder.png")}
                      source={`${result.Image[0].link}-/preview/938x432/-/quality/smart/-/format/auto/`}
                    />

                    <View className="mt-4 flex w-full flex-row items-center justify-between">
                      <View className=" text-left text-xl font-bold text-gray-700">
                        <SKText>{item.name} </SKText>
                      </View>
                      <View className="text-md rounded-lg bg-[#1dbaa7] px-2 py-1 font-medium text-gray-900">
                        <SKText>${item.amount} </SKText>
                      </View>
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
