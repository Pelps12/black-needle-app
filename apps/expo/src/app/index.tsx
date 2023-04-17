import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchWrapper from "../components/Search/Wrapper";

const Index = () => {
  return (
    <SafeAreaView className="bg-[##F2F2F2]">
      {/* Changes page title visible on the header */}

      <View className=" ">
        {/* <Button
          onPress={() => void utils.post.all.invalidate()}
          title="Refresh posts"
          color={"#f472b6"}
        />

        <View className="py-2">
          <Text className="font-semibold italic text-white">
            Press on a post
          </Text>
        </View>
        <Image
          className="w-full"
          source={{
            uri: "https://ucarecdn.com/9aa73055-d470-4675-8e75-92d0a56b71c9/",
          }}
          alt=":)"
        />

        <FlashList
          data={postQuery.data}
          estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={(p) => (
            <PostCard
              post={p.item}
              onDelete={() => deletePostMutation.mutate(p.item.id)}
            />
          )}
        />

        <CreatePost /> */}

        <SearchWrapper />
      </View>
    </SafeAreaView>
  );
};

export default Index;
