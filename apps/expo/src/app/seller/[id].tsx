import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSearchParams } from "expo-router";

import Modal from "../../components/Modal";
import Prices from "../../components/Seller/Prices";
import { trpc } from "../../utils/trpc";

const SellerPage = () => {
  const { id } = useSearchParams();
  const idString =
    typeof id === "string" ? id : typeof id === "undefined" ? ":)" : id[0]!;
  const [activeTab, setActiveTab] = useState<string>("CATEGORIES");

  const tabs = [
    {
      label: "Appointments",
      value: "appointments",
    },
  ];
  const { data } = trpc.user.getCategories.useQuery({
    id: idString,
  });

  return (
    <SafeAreaView className="bg-[###2196F3]">
      <View className="mx-3 max-w-md flex-row items-center justify-between">
        <View className="">
          <Image
            source={data?.user?.image ?? ":)"}
            alt="Pic"
            className="mr-2 h-32 w-32 rounded-full shadow-sm "
          />
        </View>

        <View className="ml-2 w-72 flex-col items-start">
          <Text className=" text-4xl font-semibold">
            {data?.user?.name ?? "Unknown"}
          </Text>
          <Pressable
            className={`my-2 flex flex-row content-center items-center justify-center  rounded-md bg-[#1dbaa7]   text-black shadow-sm`}
            onPress={() => console.log(":)")}
          >
            <Text className="px-4 py-2 text-center text-2xl font-semibold text-white">
              Chat
            </Text>
          </Pressable>
        </View>
      </View>

      <View>
        <View className="flex flex-row flex-wrap justify-center border-b border-gray-200">
          <View className="mr-2">
            <Pressable
              aria-current="page"
              onPress={() => setActiveTab("CATEGORIES")}
            >
              <Text
                className={`inline-block rounded-t-lg px-4 py-4 text-center text-sm font-medium ${
                  activeTab == "CATEGORIES"
                    ? "text-[#72a2f9]"
                    : "text-[#25252D]"
                }`}
              >
                Categories
              </Text>
            </Pressable>
          </View>
          <View className="mr-2">
            <Pressable onPress={() => setActiveTab("PRICES")}>
              <Text
                className={`inline-block rounded-t-lg px-4 py-4 text-center text-sm font-medium ${
                  activeTab == "PRICES" ? "text-[#72a2f9]" : "text-[#25252D]"
                }`}
              >
                Prices
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View>
        {activeTab == "PRICES" && data?.user?.seller?.Category && (
          <Prices
            prices={data?.user?.seller?.Category}
            sellerId={data.user.id}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SellerPage;
