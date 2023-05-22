import React, { Fragment, useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { useAuth } from "@clerk/clerk-expo";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { type Category, type Price, type Image as PrismaImage } from "@acme/db";

import SKTest from "../../components/Utils/SKText";
import Modal from "../Modal";
import BlankCategories from "./BlankCategories";

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
  const { userId, isSignedIn } = useAuth();
  const [addCategoryButton, setAddCategoryButton] = useState(false);
  return (
    <>
      {isSignedIn && userId === sellerId ? (
        <Pressable
          onPress={() => {
            setAddCategoryButton(!addCategoryButton);
          }}
        >
          {!addCategoryButton && (
            <Feather
              name="plus-circle"
              style={{ marginLeft: 350 }}
              size={24}
              color="black"
            />
          )}
          {addCategoryButton && (
            <MaterialCommunityIcons
              style={{ marginLeft: 350 }}
              name="cancel"
              size={24}
              color="black"
            />
          )}
        </Pressable>
      ) : null}

      <View></View>

      <View>
        <FlatList
          data={categories}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListFooterComponent={<View style={{ height: 350 }} />}
          //Use flatlist. TO get the grid, do numCOlums = 2.
          ListHeaderComponent={
            addCategoryButton ? (
              <BlankCategories
                setAddCategoryButton={setAddCategoryButton}
                categories={categories}
              ></BlankCategories>
            ) : (
              <></>
            )
          }
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Category category={item} sellerId={sellerId} />
          )}
        />
      </View>
    </>
  );
};

const Category = ({
  category,
  sellerId,
}: {
  category: Category & {
    Image: PrismaImage[];
    prices: Price[]; //take a look at my flatlist in blankcategory.jsx
  };
  sellerId: string;
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [pressedImage, setPressedImage] = React.useState<string>();
  return (
    <View className="mx-auto">
      <SKTest className="mx-auto text-4xl font-semibold" fontWeight="semi-bold">
        {category.name}
      </SKTest>
      <Modal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        className=""
      >
        <Image
          className="m-2 mx-auto h-96 w-96 rounded-xl"
          placeholder={require("../../../assets/placeholder.png")}
          source={pressedImage ?? ""}
        />
      </Modal>
      <FlatList
        data={category.Image}
        className="mx-auto"
        ListFooterComponent={<View style={{ height: 40 }} />}
        contentContainerStyle={{ paddingBottom: 150, marginBottom: 200 }}
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
                placeholder={require("../../../assets/placeholder.png")}
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
