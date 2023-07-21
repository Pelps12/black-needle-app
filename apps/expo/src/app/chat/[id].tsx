import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Link, useSearchParams } from "expo-router";
import { useChannel } from "@ably-labs/react-hooks";
import { useAuth } from "@clerk/clerk-expo";
import {
  EvilIcons,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import { type Message } from "@acme/db";

import Modal from "../../components/Modal";
import SKTest from "../../components/Utils/SKText";
import SKText from "../../components/Utils/SKText";
import SKTextInput from "../../components/Utils/SKTextInput";
import { trpc } from "../../utils/trpc";

type AblyMessage = {
  isSender: boolean;
  data: {
    roomId: string;
    message: string;
  };
  extras?: {
    type: string;
  };
};

const ChatPage = () => {
  const { id } = useSearchParams();
  const idString =
    typeof id === "string" ? id : typeof id === "undefined" ? ":)" : id[0]!;

  const [messageText, setMessageText] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [image, setImage] = useState<string>();
  const [ablyMessages, setAblyMessages] = useState<AblyMessage[]>([]);

  const getRoom = trpc.chat.getRoom.useQuery({
    userId: idString,
  });

  const createRoomRouter = trpc.chat.createRoom.useMutation();
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
      staleTime: Infinity
    },
  );
  const utils = trpc.useContext();

  const { userId } = useAuth();
  const endRef = useRef<FlatList>(null);

  const [_, ably] = useChannel(`chat:${userId}`, (message) => {
    console.log(userId, message);
    if (message.data.receipientId == userId) {
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
    }
  });
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]?.uri);
      setImageModalVisible(true);
    }
  };

  const endImageUploadFlow = () => {
    setImageModalVisible(false);
    setImage(undefined);
  };

  useEffect(() => {
    prevMessRouter.refetch();
  }, []);

  const getBlob = async (fileUri: string) => {
    const resp = await fetch(fileUri);
    const imageBody = await resp.blob();
    return imageBody;
  };
  //Temporary
  const uploadImageHelper = async (object: Blob, roomId: string) => {
    const response = await fetch(
      `https://worker.oluwapelps.workers.dev/${roomId}`,
      {
        method: "PUT",
        body: object,
        headers: {
          Accept: "application/json",
        },
      },
    );

    return response;
  };

  const uploadImage = async (): Promise<string | null> => {
    if (getRoom.data?.room && image) {
      const response = await uploadImageHelper(
        await getBlob(image),
        getRoom.data.room.id,
      );

      if (response.ok) {
        const result = await response.json();
        return result.imageId;
      }
    }
    return null;
  };
  const createRoomWrapper = () => {
		if (id) {
			createRoomRouter.mutate(
				{
					userId: idString
				},
				{
					onSuccess: (data) => {
						getRoom.refetch();
					}
				}
			);
		}
	};

  const handleSubmit = async (type: string) => {
    if (getRoom.isSuccess && getRoom.data.room) {
      if (type === "image") {
        const result = await uploadImage();
        console.log(result);
        if (result) {
          await ably.channels.get(`chat:${id}`).publish({
            name: "message",
            data: {
              roomId: getRoom.data.room?.id,
              message: result,
              receipientId: idString,
            },
            extras: {
              headers: {
                type: "IMAGE",
              },
            },
          });

          setAblyMessages([
            ...ablyMessages,
            {
              isSender: true,
              data: {
                roomId: getRoom.data.room?.id,
                message: result,
              },
              extras: {
                type: "image",
              },
            },
          ]);
        }
      } else {
        if (messageText !== "") {
          await ably.channels.get(`chat:${id}`).publish({
            name: "message",
            data: {
              roomId: getRoom.data.room?.id,
              message: messageText,
              receipientId: idString,
            },
            extras: {
              headers: {
                type: "TEXT",
              },
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
              extras: {
                type: "text",
              },
            },
          ]);
        }
      }
    }
    setMessageText("");
    utils?.chat.getRecentRooms.invalidate();
  };

  useEffect(() => {
    if (prevMessRouter.data?.pages.length === 1) {
      const oldMessagesLength = prevMessRouter.data?.pages
        .map((page) => page.messages.length)
        .reduce((total, item) => total + item);
      console.log(oldMessagesLength);
    }
  }, [prevMessRouter.isFetched]);

  useEffect(() => {
    console.log(ablyMessages);
  }, [ablyMessages]);

  useEffect(() => {
    return () => {
      setAblyMessages([]);
      console.log("SENT");
    };
  }, []);

  useEffect(() => {
    console.log(getRoom?.data?.room?.id)
  }, [getRoom?.data?.room?.id])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
      style={{ flex: 1 }}
    >
      <Fragment>
        <View className="relative mt-0 flex flex-row items-center border-b border-gray-300 p-3 pb-2 pt-0">
          <Link href="/chat">
            <Ionicons name="arrow-back" size={30} color="black" />
          </Link>

          {getRoom.data?.user?.image ? (
            <Image
              className="h-16 w-16 rounded-full "
              source={getRoom.data?.user?.image}
            />
          ) : (
            <View className="h-16 w-16 rounded-full bg-[#d9d9d9]" />
          )}

          {!getRoom.isLoading ? (
            <SKTest
              className="ml-2 block text-lg font-bold text-gray-600"
              fontWeight="semi-bold"
            >
              {getRoom.data?.user?.name || "No Name"}
            </SKTest>
          ) : (
            <Image
              source={require("../../../assets/placeholder.png")}
              className="ml-2 h-7 w-28 rounded-md"
            />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View className="space-y-2" style={{ flex: 0.9 }}>
            {getRoom?.data?.room?.id  ? (
              <>
              {prevMessRouter.data?.pages && ablyMessages && <SectionList
                onEndReached={() => prevMessRouter.fetchNextPage()}
                className="px-3"
                sections={[
                  {
                    data: prevMessRouter.data?.pages,
                    renderItem: (page) => (
                      <FlatList
                        data={page.item.messages}
                        renderItem={({ item }) => (
                          <MessageComponent message={item} userId={userId} />
                        )}
                        ref={endRef}
                        keyExtractor={(item) => item.id.toString()}
                        inverted={true}
                      />
                    ),
                  },
                  {
                    data: ablyMessages,
                    renderItem: (page) => (
                      <AblyMessageComponent message={page.item} />
                    ),
                  },
                ]}
                contentContainerStyle={{
                  paddingBottom: 20,
                  flexDirection: "column-reverse",
                }}
                inverted={true}
                onScrollToTop={() => console.log("SLOPPY TOPPY")}
                keyExtractor={(item, idx) => idx.toString()}
              />
              }</>
            ): getRoom.isFetched && <Pressable
            className={`w-32 flex flex-row m-auto content-center items-center justify-center rounded-lg  bg-[#1dbaa7] px-3 py-3  text-black `}
            onPress={() => createRoomWrapper()}
          >
            <SKTest className="mx-auto text-md text-center font-semibold text-white" fontWeight="semi-bold">
              START CHAT
            </SKTest>
          </Pressable>}
          </View>

          <View
            style={{ flex: 0.1 }}
            className="mx-6  my-6 flex flex-row items-end justify-center border-t border-gray-300 px-6 pb-4 pt-2"
          >
            <Modal
              modalVisible={imageModalVisible}
              setModalVisible={setImageModalVisible}
            >
              <ImagePreview
                image={image}
                cancel={endImageUploadFlow}
                handleSubmit={handleSubmit}
              />
            </Modal>
            <View className="mx-3 w-full gap-2 pl-4 outline-none">
              <SKTextInput
                multiline={true}
                value={messageText}
                onChangeText={setMessageText}
                numberOfLines={4}
                placeholder="Send Message"
                className="bg-gray-10 rounded-full border border-[#d9d9d9] p-2"
              />
            </View>

            <Pressable onPress={() => pickImage()}>
              <EvilIcons name="image" size={30} color="black" />
            </Pressable>

            <Pressable onPress={() => handleSubmit("text")} className="">
              <Feather name="send" size={25} color="black" />
            </Pressable>
          </View>
        </View>
      </Fragment>
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
  const chatImageRouter = trpc.upload.getPresignedUrl.useQuery(
    {
      type: "GET",
      roomId: message.roomId,
      key: message.message,
    },
    {
      enabled: message.type === "IMAGE",
    },
  );

  return (
    <View
      className={`flex flex-row ${
        message.userId === userId ? "justify-end" : "justify-start"
      } my-2`}
    >
      {message.type === "IMAGE" ? (
        <View className="max-w-s relative rounded-lg ">
          <Image
            source={chatImageRouter.data}
            className="h-64 w-48 rounded-lg"
          />
        </View>
      ) : (
        <View
          className={`relative max-w-xs rounded-lg ${
            message.userId === userId ? "bg-[#1dbaa7]" : "bg-white"
          } px-4 py-2 text-gray-700 shadow`}
        >
          <SKTest className="block">{message.message}</SKTest>
        </View>
      )}
    </View>
  );
};

const ImagePreview: React.FC<{
  image: string | undefined;
  handleSubmit: (type: string) => Promise<void>;
  cancel: () => void;
}> = ({ image, handleSubmit, cancel }) => {
  const uploadImage = async () => {
    await handleSubmit("image");
    cancel();
  };
  return (
    <View className="mx-auto rounded-md">
      <Image source={image} className="h-96 w-72" />

      <View className="flex-row">
        <Pressable
          className={`mx-auto my-2 flex w-32  flex-row content-center items-center justify-center rounded-md bg-white px-3 py-3 shadow-sm`}
          onPress={cancel}
        >
          <MaterialIcons name="cancel" size={24} color="red" />
          <SKTest
            className="ml-2 text-xl font-semibold text-black"
            fontWeight="semi-bold"
          >
            Cancel
          </SKTest>
        </Pressable>

        <Pressable
          className={`mx-auto my-2 flex w-32  flex-row content-center items-center justify-center rounded-md bg-white px-3 py-3 shadow-sm`}
          onPress={uploadImage}
        >
          <Ionicons name="checkmark" size={24} color="green" />
          <SKText
            className="ml-2 text-xl font-semibold text-black"
            fontWeight="semi-bold"
          >
            Send
          </SKText>
        </Pressable>
      </View>
    </View>
  );
};

const AblyMessageComponent = ({ message }: { message: AblyMessage }) => {
  const chatImageRouter = trpc.upload.getPresignedUrl.useQuery(
    {
      type: "GET",
      roomId: message.data.roomId,
      key: message.data.message,
    },
    {
      enabled: message.extras?.type === "image",
    },
  );
  return (
    <View
      className={`flex flex-row ${
        message.isSender ? "justify-end" : "justify-start"
      } my-2`}
    >
      {message.extras?.type === "image" ? (
        <View className="max-w-s relative rounded-lg ">
          <Image
            source={chatImageRouter.data}
            className="h-64 w-48 rounded-lg"
          />
        </View>
      ) : (
        <View
          className={`relative max-w-xs rounded-lg ${
            message.isSender ? "bg-[#1dbaa7]" : "bg-white"
          } px-4 py-2 text-gray-700 shadow`}
        >
          <SKTest className="block">{message.data.message}</SKTest>
        </View>
      )}
    </View>
  );
};
