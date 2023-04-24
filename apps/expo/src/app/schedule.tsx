import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";

import Modal from "../components/Modal";
import Appointment from "../components/Schedule/Appointment";
import Categories from "../components/Seller/Categories";
import Prices from "../components/Seller/Prices";
import { trpc } from "../utils/trpc";

const SellerPage = () => {
  const { id } = useSearchParams();
  const idString =
    typeof id === "string" ? id : typeof id === "undefined" ? ":)" : id[0]!;
  const [activeTab, setActiveTab] = useState<string>("APPOINTMENTS");

  const appointment = trpc.appointment.getAppointment.useQuery({
    sellerMode: false,
  });

  return (
    <SafeAreaView className="bg-[###2196F3]">
      <View>
        <View className="flex flex-row flex-wrap justify-center border-b border-gray-200">
          <View className="mr-2">
            <Pressable onPress={() => setActiveTab("APPOINTMENTS")}>
              <Text
                className={`inline-block rounded-t-lg px-4 py-4 text-center text-sm font-medium ${
                  activeTab == "APPOINTMENTS"
                    ? "text-[#72a2f9]"
                    : "text-[#25252D]"
                }`}
              >
                Appointments
              </Text>
            </Pressable>
          </View>
          <View className="mr-2">
            <Pressable
              aria-current="page"
              onPress={() => setActiveTab("ORDERS")}
            >
              <Text
                className={`inline-block rounded-t-lg px-4 py-4 text-center text-sm font-medium ${
                  activeTab == "ORDERS" ? "text-[#72a2f9]" : "text-[#25252D]"
                }`}
              >
                Orders
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View>
        {activeTab == "APPOINTMENTS" && (
          <FlatList
            data={appointment.data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListFooterComponent={<View style={{ height: 100 }} />}
            renderItem={({ item }) => (
              <Appointment
                refetch={appointment.refetch}
                appointments={item}
                sellerMode={false}
              />
            )}
          />
        )}

        {activeTab == "ORDERS" && <Text>HMMM</Text>}
      </View>
    </SafeAreaView>
  );
};

export default SellerPage;
