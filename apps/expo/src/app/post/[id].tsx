import { SafeAreaView, Text, View } from "react-native";
import { SplashScreen, Stack, useSearchParams } from "expo-router";

import { trpc } from "../../utils/trpc";

const Post: React.FC = () => {
  const { id } = useSearchParams();
  const idString =
    typeof id === "string" ? id : typeof id === "undefined" ? ":)" : id[0]!;
  const { data } = trpc.post.byId.useQuery({ id: idString });

  if (!data) return <SplashScreen />;

  return (
    <SafeAreaView className="bg-[#1F104A]">
      <Stack.Screen options={{ title: data.title }} />
      <View className="h-full w-full p-4">
        <Text className="py-2 text-3xl font-bold text-white">{data.title}</Text>
        <Text className="py-4 text-white">{data.content}</Text>
      </View>
    </SafeAreaView>
  );
};

export default Post;
