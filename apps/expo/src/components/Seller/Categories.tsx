import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";

import Modal from "../Modal";
import {
  type Category,
  type Price,
  type Image as PrismaImage,
} from ".prisma/client";

const Categories = ({
  categories,
  sellerId,
}: {
  categories: (Category & {
    Image: PrismaImage[];
    prices: Price[];
  })[];
  sellerId: string;
}) => {
  return (
    <View>
      <FlatList
        data={categories}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListFooterComponent={<View style={{ height: 350 }} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Category category={item} sellerId={sellerId} />
        )}
      />
    </View>
  );
};

const Category = ({
  category,
  sellerId,
}: {
  category: Category & {
    Image: PrismaImage[];
    prices: Price[];
  };
  sellerId: string;
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [pressedImage, setPressedImage] = React.useState<string>();
  return (
    <View className="mx-auto">
      <Text className="mx-auto text-4xl font-semibold">{category.name}</Text>
      <Modal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        className=""
      >
        <Image
          source={pressedImage ?? ""}
          alt="Image"
          className="m-2 mx-auto h-96 w-96 rounded-xl"
        />
      </Modal>

      <FlatList
        data={category.Image}
        className="mx-auto"
        ListFooterComponent={<View style={{ height: 40 }} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <>
            <Pressable
              onPress={() => {
                setModalVisible(true);
                setPressedImage(item.link);
              }}
            >
              <Image
                source={item.link}
                alt="Image"
                className="m-2 h-44 w-44 rounded-xl"
              />
            </Pressable>
          </>
        )}
        numColumns={2}
      />
    </View>
  );
};

export default Categories;
