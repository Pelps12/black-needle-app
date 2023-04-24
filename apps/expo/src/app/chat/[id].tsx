import React, { Fragment, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Link, useSearchParams } from "expo-router";
import { useChannel } from "@ably-labs/react-hooks";
import { useAuth } from "@clerk/clerk-react";
import { Feather, Ionicons } from "@expo/vector-icons";

import { type Message } from "@acme/db";

import { trpc } from "../../utils/trpc";

type AblyMessage = {
  isSender: boolean;
  data: {
    roomId: string;
    message: string;
  };
};

const ChatPage = () => {
  const { id } = useSearchParams();
  const idString =
    typeof id === "string" ? id : typeof id === "undefined" ? ":)" : id[0]!;

  const [messageText, setMessageText] = useState<string>("");
  const [ablyMessages, setAblyMessages] = useState<
    {
      isSender: boolean;
      data: {
        roomId: string;
        message: string;
      };
    }[]
  >([]);

  const getRoom = trpc.chat.getRoom.useQuery({
    userId: idString,
  });

  const { userId } = useAuth();
  const scrollViewRef = useRef<FlatList>(null);

  const prevMessRouter = trpc.chat.getPreviousChats.useInfiniteQuery(
    {
      limit: 20,
      userId: idString,
      roomId: getRoom?.data?.room?.id,
    },
    {
      getPreviousPageParam: (firstPage) => firstPage.nextCursor,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      select: (data) => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse(),
      }),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
    },
  );
  const [channel, ably] = useChannel(`chat:${userId}`, (message) => {
    console.log(message);
    setAblyMessages((ablyMessages) => [
      ...ablyMessages,
      {
        isSender: false,
        data: {
          roomId: message.data.roomId,
          message: message.data.message,
        },
      },
    ]);
  });

  const handleSubmit = async () => {
    console.log(getRoom.isSuccess && getRoom.data.room && messageText !== "");
    if (getRoom.isSuccess && getRoom.data.room && messageText !== "") {
      await ably.channels.get(`chat:${id}`).publish({
        name: "message",
        data: {
          roomId: getRoom.data.room?.id,
          message: messageText,
        },
      });
      setAblyMessages([
        ...ablyMessages,
        {
          isSender: true,
          data: {
            roomId: getRoom.data.room?.id,
            message: messageText,
          },
        },
      ]);
    }
    setMessageText("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Fragment>
          <View className="relative flex flex-row items-center border-b border-gray-300 p-3">
            <Link href="/chat">
              <Ionicons name="arrow-back" size={30} color="black" />
            </Link>

            {getRoom.data?.user?.image ? (
              <Image
                className="h-16 w-16 rounded-full "
                source={getRoom.data?.user?.image}
                alt="username"
              />
            ) : (
              <View className="h-16 w-16 rounded-full bg-[#d9d9d9]" />
            )}

            <Text className="ml-2 block text-lg font-bold text-gray-600">
              {getRoom.data?.user?.name || "No Name"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View className="space-y-2" style={{ flex: 0.9 }}>
              {
                <Fragment>
                  {prevMessRouter.data?.pages && (
                    <FlatList
                      data={prevMessRouter.data?.pages}
                      ref={scrollViewRef}
                      onContentSizeChange={() =>
                        scrollViewRef.current?.scrollToEnd({ animated: true })
                      }
                      onScrollToTop={() => console.log("SLOPPY TOPPY")}
                      ItemSeparatorComponent={() => (
                        <View className="border-b-2 border-[#ddd]" />
                      )}
                      renderItem={({ item: page }) => (
                        <FlatList
                          data={page.messages}
                          renderItem={({ item }) => (
                            <MessageComponent message={item} userId={userId} />
                          )}
                          keyExtractor={(item) => item.id.toString()}
                          inverted={true}
                        />
                      )}
                      keyExtractor={(item, idx) => idx.toString()}
                    />
                  )}
                  <FlatList
                    data={ablyMessages}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                      <AblyMessageComponent message={item} />
                    )}
                  />
                </Fragment>
              }
            </View>

            <View
              style={{ flex: 0.1 }}
              className="flex  flex-row items-start justify-center border-t border-gray-300 px-6 py-3"
            >
              <TextInput
                multiline={true}
                value={messageText}
                onChangeText={setMessageText}
                numberOfLines={1}
                placeholder="Send Message"
                className="mx-3 block w-full rounded-full bg-gray-100 py-2 pl-4 outline-none focus:text-gray-700"
              />

              <Pressable onPress={() => handleSubmit()}>
                <Feather name="send" size={20} color="black" />
              </Pressable>
            </View>
          </View>
        </Fragment>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ChatPage;

const MessageComponent = ({
  message,
  userId,
}: {
  message: Message;
  userId: string | null | undefined;
}) => {
  return (
    <View
      className={`flex flex-row ${
        message.userId === userId ? "justify-end" : "justify-start"
      } my-2`}
    >
      <View
        className={`relative max-w-xs rounded ${
          message.userId === userId ? "bg-[#1dbaa7]" : "bg-white"
        } px-4 py-2 text-gray-700 shadow`}
      >
        <Text className="block">{message.message}</Text>
      </View>
    </View>
  );
};

const AblyMessageComponent = ({ message }: { message: AblyMessage }) => {
  return (
    <View
      className={`flex flex-row ${
        message.isSender ? "justify-end" : "justify-start"
      } my-2`}
    >
      <View
        className={`relative max-w-xs rounded ${
          message.isSender ? "bg-[#1dbaa7]" : "bg-white"
        } px-4 py-2 text-gray-700 shadow`}
      >
        <Text className="block">{message.data.message}</Text>
      </View>
    </View>
  );
};
