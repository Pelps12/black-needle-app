import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { useSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

const ChatPage = () => {
  const { id } = useSearchParams();

  return (
    <View className="w-full">
      <View className="relative flex items-center border-b border-gray-300 p-3">
        <Image
          className="h-10 w-10 rounded-full object-cover"
          source="https://cdn.pixabay.com/photo/2018/01/15/07/51/woman-3083383__340.jpg"
          alt="username"
        />
        <Text className="ml-2 block font-bold text-gray-600">Emma</Text>
        <Text className="absolute left-10 top-3 h-3 w-3 rounded-full bg-green-600"></Text>
      </View>
      <View className="relative h-[40rem] w-full overflow-y-auto p-6">
        <View className="space-y-2">
          <View className="flex justify-start">
            <View className="relative max-w-xl rounded px-4 py-2 text-gray-700 shadow">
              <Text className="block">Hi</Text>
            </View>
          </View>
          <View className="flex justify-end">
            <View className="relative max-w-xl rounded bg-gray-100 px-4 py-2 text-gray-700 shadow">
              <Text className="block">Hiiii</Text>
            </View>
          </View>
          <View className="flex justify-end">
            <View className="relative max-w-xl rounded bg-gray-100 px-4 py-2 text-gray-700 shadow">
              <Text className="block">how are you?</Text>
            </View>
          </View>
          <View className="flex justify-start">
            <View className="relative max-w-xl rounded px-4 py-2 text-gray-700 shadow">
              <Text className="block">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="flex w-full items-center justify-between border-t border-gray-300 p-3">
        <TextInput
          placeholder="Message"
          className="mx-3 block w-full rounded-full bg-gray-100 py-2 pl-4 outline-none focus:text-gray-700"
        />

        <Pressable>
          <Feather name="send" size={24} color="black" />
        </Pressable>
      </View>
    </View>
  );
};

export default ChatPage;
