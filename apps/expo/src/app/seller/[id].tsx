import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Link, useSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

import { Category, Price, Image as PrismaImage } from "@acme/db";

import Categories from "../../components/Seller/Categories";
import Prices from "../../components/Seller/Prices";
import SKTest from "../../components/Utils/SKText";
import { trpc } from "../../utils/trpc";
import ProtectedLink from "../../components/Utils/ProtectedLink";

type SellerPageProps = {
  sellerId?: string | null | undefined;
};

const SellerPage: React.FC<SellerPageProps> = ({ sellerId }) => {
  const params = useSearchParams();
  const id = sellerId ?? params.id;
  const idString =
    typeof id === "string" ? id : typeof id === "undefined" ? ":)" : id[0]!;
  const [activeTab, setActiveTab] = useState<string>("CATEGORIES");
  const [user, setUser] = useState<any>(undefined);

  const { user: clerkUser } = useUser();

  const categoriesEndpoint = trpc.user.getCategories.useQuery(
    {
      id: idString,
    },
    {
      enabled: false,
    },
  );
  const [categories, setCategories] = useState<
    (Category & { Image: PrismaImage[]; prices: Price[] })[] | undefined
  >(undefined);

  useEffect(() => {
    async function anyNameFunction() {
      const { data, isSuccess } = await categoriesEndpoint.refetch();
      if (isSuccess) {
        setCategories(data.user?.seller?.Category);
        setUser(data.user);
      }
    }

    // Execute the created function directly
    if (typeof idString === "string") {
      console.log(idString);
      anyNameFunction();
    }
  }, [idString]);

  return (
    <SafeAreaView className="bg-[##2196F3]">
      <View className="mx-3 max-w-md flex-row items-center justify-between">
        <View className="">
          {/* Temporary */}
          <Image
            source={categoriesEndpoint?.data?.user?.image}
            className="mr-2 h-20 w-20 rounded-xl shadow-sm "
            placeholder={require("../../../assets/placeholder.png")}
          />
        </View>

        <View className="ml-2 w-72 flex-col items-start">
          {categoriesEndpoint.isLoading ? (
            <Image
              className="mr-2 h-10 w-48 rounded-xl shadow-sm"
              source={require("../../../assets/placeholder.png")}
            />
          ) : (
            <SKTest
              className=" max-w-xs text-2xl font-semibold"
              fontWeight="semi-bold"
            >
              {categoriesEndpoint.data?.user?.name ?? "Unknown"}
            </SKTest>
          )}
          {categoriesEndpoint.isSuccess &&
            categoriesEndpoint.data?.user?.id !== clerkUser?.id && (
              <ProtectedLink className="my-2" href={`/chat/${idString}`}>
                <View
                  className={` flex flex-row content-center items-center justify-center rounded-lg  bg-[#1dbaa7] px-3 py-1  text-black `}
                >
                  <SKTest className=" text-md text-center font-semibold text-white">
                    CHAT
                  </SKTest>
                </View>
              </ProtectedLink>
            )}
        </View>
      </View>

      <View>
        <View className="flex flex-row flex-wrap justify-center border-b border-gray-200">
          <View className="mr-2">
            <Pressable
              aria-current="page"
              onPress={() => setActiveTab("CATEGORIES")}
            >
              <SKTest
                fontWeight="medium"
                className={`inline-block rounded-t-lg px-4 py-4 text-center text-sm font-medium ${
                  activeTab == "CATEGORIES"
                    ? "text-[#72a2f9]"
                    : "text-[#25252D]"
                }`}
              >
                Categories
              </SKTest>
            </Pressable>
          </View>
          <View className="mr-2">
            <Pressable onPress={() => setActiveTab("PRICES")}>
              <SKTest
                fontWeight="medium"
                className={`inline-block rounded-t-lg px-4 py-4 text-center text-sm font-medium ${
                  activeTab == "PRICES" ? "text-[#72a2f9]" : "text-[#25252D]"
                }`}
              >
                Prices
              </SKTest>
            </Pressable>
          </View>
        </View>
      </View>

      <View>
        {activeTab == "PRICES" && categories && (
          <Prices prices={categories} sellerId={user?.id} />
        )}

        {activeTab == "CATEGORIES" && categories && (
          <Categories
            setCategories={setCategories}
            categories={categories}
            sellerId={user?.id}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SellerPage;
