import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Switch,
  Text,
  View,
} from "react-native";
import { useSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

import Appointment from "../../components/Schedule/Appointment";
import Loading from "../../components/Utils/Loading";
import SKText from "../../components/Utils/SKText";
import { trpc } from "../../utils/trpc";

const SellerPage = () => {
  const { id } = useSearchParams();
  const idString =
    typeof id === "string" ? id : typeof id === "undefined" ? ":)" : id[0]!;
  const [activeTab, setActiveTab] = useState<string>("APPOINTMENTS");
  const [sellerMode, setSellerMode] = useState(false);

  const utils = trpc.useContext();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    utils?.appointment.invalidate().then(() => setRefreshing(false));
  }, []);

  const appointments = trpc.appointment.getAppointments.useQuery({
    sellerMode,
  });

  const { user } = useUser();

  return (
    <SafeAreaView className="">
      <SKText fontWeight="semi-bold" className="mx-4 text-4xl font-bold">
        Schedule
      </SKText>
      <View>
        <View className="flex flex-row flex-wrap justify-center border-b border-gray-200">
          <View className="mr-2">
            <Pressable onPress={() => setActiveTab("APPOINTMENTS")}>
              <SKText
                className={`inline-block rounded-t-lg px-4 py-4 text-center text-sm font-medium ${
                  activeTab == "APPOINTMENTS"
                    ? "text-[#72a2f9]"
                    : "text-[#25252D]"
                }`}
                fontWeight="medium"
              >
                Appointments
              </SKText>
            </Pressable>
          </View>
          <View className="mr-2">
            <Pressable
              aria-current="page"
              onPress={() => setActiveTab("ORDERS")}
            >
              <SKText
                className={`inline-block rounded-t-lg px-4 py-4 text-center text-sm font-medium ${
                  activeTab == "ORDERS" ? "text-[#72a2f9]" : "text-[#25252D]"
                }`}
                fontWeight="medium"
              >
                Orders
              </SKText>
            </Pressable>
          </View>
        </View>
      </View>

      <View>
        <FlatList
          data={activeTab === "APPOINTMENTS" ? appointments.data : null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <>
              {user?.publicMetadata.role === "SELLER" && (
                <View className="flex-row items-center justify-center gap-1 p-3">
                  <SKText
                    className={`text-lg ${
                      sellerMode ? "" : "font-bold text-[#1dbaa7]"
                    }`}
                    fontWeight={sellerMode ? "medium" : "bold"}
                  >
                    Buyer
                  </SKText>
                  <Switch
                    onValueChange={setSellerMode}
                    thumbColor={"#f2f2f2"}
                    trackColor={{
                      true: "#1dbaa7",
                    }}
                    style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                    value={sellerMode}
                    className="text-right"
                  />
                  <SKText
                    className={`text-lg ${
                      sellerMode ? "font-bold text-[#1dbaa7]" : ""
                    }`}
                    fontWeight={!sellerMode ? "medium" : "bold"}
                  >
                    Seller
                  </SKText>
                </View>
              )}
              <Loading loading={appointments.isLoading} />
            </>
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 170 }}
          ListFooterComponent={<View style={{ height: 100 }} />}
          renderItem={({ item }) => (
            <>
              {activeTab === "APPOINTMENTS" ? (
                <Appointment
                  refetch={appointments.refetch}
                  appointments={item}
                  sellerMode={false}
                />
              ) : (
                <></>
              )}
            </>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default SellerPage;
