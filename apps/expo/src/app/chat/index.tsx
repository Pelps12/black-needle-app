import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useAuth } from "@clerk/clerk-react";
import formatDistanceStrict from "date-fns/formatDistanceStrict";

import { type Message, type Participant, type Room } from "@acme/db";

import { trpc } from "../../utils/trpc";

const ChatIndex = () => {
  const getPreviousChats = trpc.chat.getRecentRooms.useQuery();
  const utils = trpc.useContext();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    console.log("WORKINGGGGG");
    utils?.chat.invalidate().then(() => setRefreshing(false));
  }, []);

  return (
    getPreviousChats.data && (
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
    )
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
                alt="username"
              />
            ) : (
              <View className="h-16 w-16 rounded-full bg-[#d9d9d9]" />
            )}
          </View>

          <View className="w-full">
            <View className="flex justify-between">
              <Text className="ml-2 block font-semibold text-gray-600">
                {otherUser?.user.name ?? "No Name"}
              </Text>
              <Text className="ml-2 block text-sm text-gray-600">
                {formatDistanceStrict(
                  data.Message[0]?.sendAt || new Date(),
                  new Date(),
                  {
                    addSuffix: true,
                  },
                )}
              </Text>
            </View>
            <Text className="ml-2 block text-sm text-gray-600">
              {(data.Message[0]?.message.length ?? 0) < 20
                ? data.Message[0]?.message
                : data.Message[0]?.message.substring(0, 20) + " ..."}
            </Text>
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
