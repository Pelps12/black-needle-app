import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Link, useNavigation } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { EvilIcons } from "@expo/vector-icons";
import formatDistanceStrict from "date-fns/formatDistanceStrict";

import { type Message, type Participant, type Room } from "@acme/db";

import Loading from "../../components/Utils/Loading";
import SKTest from "../../components/Utils/SKText";
import { trpc } from "../../utils/trpc";

const ChatIndex = () => {
  const getPreviousChats = trpc.chat.getRecentRooms.useQuery(undefined, {
    refetchInterval: 45000,
  });
  const utils = trpc.useContext();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    console.log("WORKINGGGGG");
    utils?.chat.invalidate().then(() => setRefreshing(false));
  }, []);

  return (
    <View>
      <SKTest className="mx-3 text-4xl font-bold" fontWeight="semi-bold">
        Messages
      </SKTest>
      <Loading loading={getPreviousChats.isLoading} />
      {getPreviousChats.data && (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => <Message data={item} />}
          data={getPreviousChats.data}
          keyExtractor={(item) => item.id}
          className="p-3"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const Message = ({
  data,
}: {
  data: Room & {
    Participant: (Participant & {
      user: {
        image: string | null;
        name: string | null;
      };
    })[];
    Message: Message[];
  };
}) => {
  const { userId } = useAuth();
  const otherUser = data.Participant.find(
    (participant) => participant.id !== userId,
  );
  const isRead = React.useCallback(
    (message: Message | undefined) => {
      if (message) {
        return !(message.userId !== userId && !message.read);
      } else {
        return true;
      }
    },
    [userId],
  );
  return (
    <>
      {userId && otherUser && (
        <Link
          href={`/chat/${otherUser.userId}`}
          className=" my-auto flex cursor-pointer flex-row items-center justify-center border-b border-gray-300 p-3 text-sm"
        >
          <View>
            {otherUser?.user.image ? (
              <Image
                className="h-16 w-16 rounded-full "
                source={otherUser?.user.image}
              />
            ) : (
              <View className="h-16 w-16 rounded-full bg-[#d9d9d9]" />
            )}
          </View>

          <View className="relative w-full">
            <View className="flex justify-between">
              <SKTest
                className={`ml-2 block font-semibold ${
                  isRead(data.Message[0]) ? "text-gray-600" : "text-black"
                }`}
                fontWeight="semi-bold"
              >
                {otherUser?.user.name ?? "No Name"}
              </SKTest>
              <SKTest className="ml-2 block text-sm text-gray-600">
                {formatDistanceStrict(
                  data.Message[0]?.sendAt || new Date(),
                  new Date(),
                  {
                    addSuffix: true,
                  },
                )}
              </SKTest>
            </View>
            <SKTest
              className={`ml-2 block text-sm ${
                isRead(data.Message[0]) ? "text-gray-600" : "text-black"
              }`}
              fontWeight={isRead(data.Message[0]) ? "normal" : "bold"}
            >
              {data.Message[0]?.type !== "IMAGE" ? (
                <>
                  {(data.Message[0]?.message.length ?? 0) < 20
                    ? data.Message[0]?.message
                    : data.Message[0]?.message.substring(0, 20) + " ..."}
                </>
              ) : (
                <View className="flex-row items-center">
                  <EvilIcons name="image" size={24} color="grey" />
                  <SKTest
                    className="text-gray-600"
                    fontWeight={isRead(data.Message[0]) ? "normal" : "bold"}
                  >
                    IMAGE
                  </SKTest>
                </View>
              )}
            </SKTest>
          </View>
        </Link>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  separator: {},
  item: {
    padding: 18,
  },
});

export default ChatIndex;
