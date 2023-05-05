import React, { Fragment, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useAuth } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";

import Modal from "../Modal";

const BlankCategories = ({ categories }) => {
  return (
    <>
      <BlankCategory categories={categories}></BlankCategory>
    </>
  );
};

// here
const BlankCategory = ({ categories }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [pressedImage, setPressedImage] = useState("");
  const [addFormData, setAddFormData] = useState({
    id: (categories?.length || 0) + 1,
    name: "",
    Image: [
      {
        id: 1,
        link: "https://ucarecdn.com/8fa4a0f9-dd32-42b8-8574-f27a0a254c72/",
      },
      {
        id: 2,
        link: "https://ucarecdn.com/8fa4a0f9-dd32-42b8-8574-f27a0a254c72/",
      },
      {
        id: 3,
        link: "https://ucarecdn.com/8fa4a0f9-dd32-42b8-8574-f27a0a254c72/",
      },
      {
        id: 4,
        link: "https://ucarecdn.com/8fa4a0f9-dd32-42b8-8574-f27a0a254c72/",
      },
    ],
  });
  return (
    <>
      <View className="mx-auto">
        <FlatList
          data={addFormData.Image}
          className="mx-auto"
          ListFooterComponent={<View style={{ height: 40 }} />}
          keyExtractor={(item) => item.id.toString()}
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
                  style={{ width: 176, height: 176 }}
                  className="m-2 h-44 w-44 rounded-xl"
                />
              </Pressable>
            </>
          )}
          numColumns={2}
        />
      </View>
    </>
  );
};

export default BlankCategories;
