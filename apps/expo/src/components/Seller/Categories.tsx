import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useAuth } from "@clerk/clerk-expo";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

import { type Category, type Price, type Image as PrismaImage } from "@acme/db";

import { trpc } from "../../utils/trpc";
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
  setCategories:{
    categories: (Category & {
      Image: PrismaImage[];
      prices: Price[];
    })[];
}) => {
  const { userId, isSignedIn } = useAuth();
  const [addCategoryButton, setAddCategoryButton] = useState(false);
  const endRef = useRef<FlatList>(null);
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
              style={{ marginLeft: 350, marginBottom: 5 }}
              size={24}
              color="black"
            />
          )}
          {addCategoryButton && (
            <MaterialCommunityIcons
              style={{ marginLeft: 350, marginBottom: 5 }}
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
          ref={endRef}
          //Use flatlist. TO get the grid, do numCOlums = 2.
          ListHeaderComponent={
            addCategoryButton ? (
              <BlankCategories
                endRef={endRef}
                sellerId={sellerId}
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
  const [editButton, setEditButton] = React.useState(false);
  const catDelete = trpc.user.deleteCategory.useMutation();
  const getCat = trpc.user.getCategories.useQuery(
    {
      id: sellerId,
    },
    // {
    //   refetchInterval: undefined,
    //   enabled: false,
    // },
  );
  return (
    <View className="mx-auto">
<<<<<<< HEAD
      <Text className="mx-auto text-4xl font-semibold">{category.name}</Text>
      <View className="flex-row justify-end ">
        <View className="mr-2">
          <Pressable
            onPress={() => {
              console.log(category.name);
              setEditButton(!editButton);
            }}
          >
            <Feather style={{}} name="edit-2" size={24} color="black" />
          </Pressable>
        </View>

        <View className="">
          <Pressable
            onPress={async () => {
              console.log("Pressed");
              await catDelete.mutateAsync({
                id: category.id,
              });

              const { data, isSuccess } = await getCat.refetch();
              if (isSuccess) {
                console.log(data);
              }
            }}
          >
            <MaterialCommunityIcons
              style={{}}
              name="delete-outline"
              size={24}
              color="black"
            />
          </Pressable>
        </View>
      </View>
      {/* <Modal
=======
      <SKTest className="mx-auto text-4xl font-semibold" fontWeight="semi-bold">
        {category.name}
      </SKTest>
      <Modal
>>>>>>> d469d9157af4a87ccf4184e1b5f594817189122d
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        className=""
      >
        <Image
          className="m-2 mx-auto h-96 w-96 rounded-xl"
          placeholder={require("../../../assets/placeholder.png")}
          source={pressedImage ?? ""}
        />
      </Modal> */}
      <FlatList
        data={category.Image}
        className="mx-auto"
        ListFooterComponent={<View style={{ height: 40 }} />}
        contentContainerStyle={{ paddingBottom: 150, marginBottom: 200 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <>
<<<<<<< HEAD
            <View style={{ position: "relative" }}>
              <Pressable
                onPress={() => {
                  setModalVisible(true);
                  setPressedImage(item.link);
                }}
              >
                <Image
                  source={item.link}
                  alt="Image"
                  className="m-2 h-44 w-44 "
                />
              </Pressable>
              <View style={{ position: "absolute", top: 0, right: 0 }}>
                {editButton && (
                  <TouchableHighlight
                    onPress={() => {
                      console.log("item.id");
                    }}
                    style={{
                      backgroundColor: "red",
                      borderTopLeftRadius: 100,
                      borderTopRightRadius: 100,
                      borderBottomLeftRadius: 100,
                      overflow: "hidden",
                      borderBottomRightRadius: 100,
                    }}
                  >
                    <Text className="  h-5 w-5 text-center text-white   ">
                      X
                    </Text>
                  </TouchableHighlight>
                )}
              </View>
            </View>
=======
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
>>>>>>> d469d9157af4a87ccf4184e1b5f594817189122d
          </>
        )}
        numColumns={2}
      />
    </View>
  );
};

export default Categories;
