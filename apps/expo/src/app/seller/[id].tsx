import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Link, useSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { AntDesign, EvilIcons } from "@expo/vector-icons";

import { Category, Price, Image as PrismaImage } from "@acme/db";

import Modal from "../../components/Modal";
import AvailabilityModal from "../../components/Seller/AvailabilityModal";
import Categories from "../../components/Seller/Categories";
import Prices from "../../components/Seller/Prices";
import ProtectedLink from "../../components/Utils/ProtectedLink";
import SKText from "../../components/Utils/SKText";
import Config from "../../utils/config";
import { trpc } from "../../utils/trpc";

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
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

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

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `${Config.PUBLIC_URL}/seller/${id}`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

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
        <View>
          <Modal
            modalVisible={calendarModalVisible}
            setModalVisible={setCalendarModalVisible}
          >
            <AvailabilityModal sellerId={user?.id}></AvailabilityModal>
          </Modal>
        </View>
        <View className="ml-2 w-72 flex-col items-start">
          {categoriesEndpoint.isLoading ? (
            <Image
              className="mr-2 h-10 w-48 rounded-xl shadow-sm"
              source={require("../../../assets/placeholder.png")}
            />
          ) : (
            <View className="flex flex-row items-center gap-2">
              <SKText
                className=" max-w-xs items-center text-2xl font-semibold"
                fontWeight="semi-bold"
              >
                {categoriesEndpoint.data?.user?.name ?? "Unknown"}
                {categoriesEndpoint.isSuccess &&
                  categoriesEndpoint.data?.user?.id === clerkUser?.id &&
                  user?.role === "SELLER" && (
                    <Pressable
                      className=" mt-1 pl-2"
                      onPress={() => {
                        setCalendarModalVisible(true);
                      }}
                    >
                      <AntDesign name="calendar" size={18} color="black" />
                    </Pressable>
                  )}
              </SKText>
              <Pressable onPress={() => onShare()}>
                <EvilIcons name="share-apple" size={32} color="black" />
              </Pressable>
            </View>
          )}
          {categoriesEndpoint.isSuccess &&
            categoriesEndpoint.data?.user?.id !== clerkUser?.id && (
              <ProtectedLink className="my-2" href={`/chat/${idString}`}>
                <View
                  className={` flex flex-row content-center items-center justify-center rounded-lg  bg-[#1dbaa7] px-3 py-1  text-black `}
                >
                  <SKText className=" text-md text-center font-semibold text-white">
                    CHAT
                  </SKText>
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
              <SKText
                fontWeight="medium"
                className={`inline-block rounded-t-lg px-4 py-4 text-center text-sm font-medium ${
                  activeTab == "CATEGORIES"
                    ? "text-[#72a2f9]"
                    : "text-[#25252D]"
                }`}
              >
                Categories
              </SKText>
            </Pressable>
          </View>
          <View className="mr-2">
            <Pressable onPress={() => setActiveTab("PRICES")}>
              <SKText
                fontWeight="medium"
                className={`inline-block rounded-t-lg px-4 py-4 text-center text-sm font-medium ${
                  activeTab == "PRICES" ? "text-[#72a2f9]" : "text-[#25252D]"
                }`}
              >
                Prices
              </SKText>
            </Pressable>
          </View>
        </View>
      </View>

      <View>
        {activeTab == "PRICES" && categories && (
          <Prices
            setCategories={setCategories}
            categories={categories}
            prices={categories}
            sellerId={user?.id}
          />
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
