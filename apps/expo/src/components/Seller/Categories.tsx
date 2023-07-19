import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from "react-native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@clerk/clerk-expo";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

import { type Category, type Price, type Image as PrismaImage } from "@acme/db";

import SKTest from "../../components/Utils/SKText";
import dataURItoBlob from "../../utils/dataURItoBlob";
import { trpc } from "../../utils/trpc";
import Modal from "../Modal";
import BlankCategories from "./BlankCategories";

type CategoryProps = {
  categories: (Category & {
    Image: PrismaImage[];
    prices: Price[];
  })[];
  sellerId: string;
  setCategories: any;
};

const Categories: React.FC<CategoryProps> = ({
  setCategories,
  categories,
  sellerId,
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
                setCategories={setCategories}
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
            <Category
              endRef={endRef}
              setCategories={setCategories}
              categories={categories}
              category={item}
              sellerId={sellerId}
            />
          )}
        />
      </View>
    </>
  );
};

const Category = ({
  category,
  sellerId,
  categories,
  setCategories,
  endRef,
}: {
  category: Category & {
    Image: PrismaImage[];
    prices: Price[]; //take a look at my flatlist in blankcategory.jsx
  };
  setCategories: any;
  sellerId: string;
  endRef: any;
  categories: (Category & {
    Image: PrismaImage[];
  })[];
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const updateCatImage = trpc.user.updateImage.useMutation();
  const cat = trpc.user.updateCategory.useMutation();
  const { userId, isSignedIn } = useAuth();
  const [oldCategory, setOldCategory] = useState("");
  const [pressedImage, setPressedImage] = React.useState<string>();
  const [editButton, setEditButton] = React.useState(false);
  const catDelete = trpc.user.deleteCategory.useMutation();
  const [categoryTitle, onChangecategoryTitle] = React.useState(category.name);
  const getCat = trpc.user.getCategories.useQuery(
    {
      id: sellerId,
    },
    // {
    //   refetchInterval: undefined,
    //   enabled: false,
    // },
  );

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      return result.assets[0];
    } else {
      alert("You did not select any image.");
    }
  };
  const checkInputBoxChange = (newTitle) => {
    onChangecategoryTitle(newTitle);
    const newCategory = [...categories];
    var categoryIndex;
    if (newCategory !== undefined) {
      categoryIndex = newCategory.map((cate) => cate.id).indexOf(category.id);
    }
    // setOldCategory(newCategory[categoryIndex].name);
    newCategory[categoryIndex].name = newTitle;
    if (newCategory[categoryIndex].name > 0) {
      setCategories(newCategory);
    }
  };
  const imageUpload = async (files) => {
    const formData = new FormData();
    formData.append(
      "UPLOADCARE_PUB_KEY",
      Constants.expoConfig?.extra?.NEXT_PUBLIC_UPLOADCARE_PUB_KEY,
    );
    formData.append("UPLOADCARE_STORE", "auto");

    // formData.append("metadata[user]", uid);

    files.forEach((file, index) => {
      console.log("John Ojo");
      console.log(file);
      let uriParts = file.uri.split(".");
      let fileType = uriParts[uriParts.length - 1];
      console.log("Inside");
      console.log(file);
      console.log(file.uri);
      console.log(file.name);
      console.log(`image/${fileType}`);
      formData.append(`my_file(${index}).jpg`, {
        uri: file.uri,
        name: "John",
        type: `image/${fileType}`,
      });
    });

    console.log(formData);

    const response = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  };

  return (
    <View className="mx-auto">
      {editButton && (
        <SafeAreaView>
          <TextInput
            placeholder="Category Name"
            keyboardType="default"
            className="mx-auto w-48 border-2"
            value={category.name}
            onChangeText={(newTitle) => checkInputBoxChange(newTitle)}
          />
        </SafeAreaView>
      )}
      {!editButton && (
        <Text className="mx-auto text-4xl font-semibold">{category.name}</Text>
      )}
      <View className="flex-row justify-end ">
        <View className="mr-2">
          <Pressable
            onPress={() => {
              setOldCategory(category.name);
              setEditButton(!editButton);
            }}
          >
            {!editButton && isSignedIn && userId === sellerId && (
              <Feather style={{}} name="edit-2" size={24} color="black" />
            )}
          </Pressable>
        </View>

        {editButton && (
          // Upload for edited images
          <View className="mr-2">
            <Pressable
              onPress={async () => {
                setEditButton(!editButton);
                var categoryIndex;
                var imageIndex;

                const newCategory = [...categories];
                if (newCategory !== undefined) {
                  categoryIndex = newCategory
                    .map((cate) => cate.id)
                    .indexOf(category.id);
                }
                console.log("here");
                if (newCategory[categoryIndex].name != oldCategory) {
                  await cat.mutate({
                    categoryId: category.id,
                    name: newCategory[categoryIndex].name,
                  });
                }
                newCategory[categoryIndex].Image.map((image) =>
                  console.log(image),
                );
                console.log(oldCategory);
                console.log("First Bus");
                console.log(newCategory);
                const getFileObjects = async () => {
                  return Promise.all(
                    newCategory[categoryIndex].Image.filter(
                      (image) => typeof image.link != "string",
                    ).map((image) => dataURItoBlob(image.link.uri)),
                    // newCategory[categoryIndex].Image.map((image) =>
                    //   dataURItoBlob(image.link.uri),
                    // ),
                  );
                };

                console.log("Last Bus");
                const files = await getFileObjects();
                console.log("About to check files");
                console.log(files);
                if (files.length > 0) {
                  console.log(files);
                  console.log("Helo");
                  newCategory[categoryIndex].Image.filter(
                    (image) => typeof image.link != "string",
                  ).map((image) => console.log(image));
                  const response = await imageUpload(
                    newCategory[categoryIndex].Image.filter(
                      (image) => typeof image.link != "string",
                    ).map((image) => image.link),
                  );
                  console.log("Ho");

                  if (response.ok) {
                    console.log(response);
                    console.log("entered");
                    const result = await response.json();
                    console.log(result);
                    console.log("We are here");
                    await updateCatImage.mutate(
                      newCategory[categoryIndex].Image.filter(
                        (image) => typeof image.link != "string",
                      ).map((image, idx) => {
                        return {
                          link: `https://ucarecdn.com/${
                            result[`my_file(${idx}).jpg`]
                          }/`,
                          imageId: image.id,
                        };
                      }),
                    );
                    // const { data, isSuccess } = await getCat.refetch();
                    // if (isSuccess) {
                    //   endRef.current?.scrollToEnd();
                    //   console.log(data);
                    // }
                  } else {
                    console.log(await response.text(), response.status);
                  }
                }
              }}
            >
              <Feather name="save" size={24} color="black" />
            </Pressable>
          </View>
        )}

        {!editButton && isSignedIn && userId === sellerId && (
          <View className="">
            <Pressable
              onPress={async () => {
                console.log("Pressed");
                await catDelete.mutateAsync({
                  id: category.id,
                });

                const { data, isSuccess } = await getCat.refetch();
                if (isSuccess) {
                  setCategories(data?.user?.seller?.Category);
                  console.log(data);
                  console.log("Ojomojos");
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
        )}

        {editButton && isSignedIn && userId === sellerId && (
          <View className="mr-2">
            <Pressable
              onPress={() => {
                setEditButton(!editButton);
              }}
            >
              <MaterialCommunityIcons name="cancel" size={24} color="black" />
            </Pressable>
          </View>
        )}
      </View>
      {/* <Modal
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
            <View style={{ position: "relative" }}>
              <Pressable
                onPress={async () => {
                  setModalVisible(true);
                  setPressedImage(item.link);
                  if (
                    item.link === require("../../../assets/placeholder(3).svg")
                  ) {
                    const imageUrl = await pickImageAsync();
                    if (imageUrl) {
                      const editedImage = {
                        id: item.id,
                        link: imageUrl,
                        categoryId: item.categoryId,
                      };
                      var categoryIndex;
                      var imageIndex;
                      const newCategory = [...categories];
                      if (newCategory !== undefined) {
                        categoryIndex = newCategory
                          .map((cate) => cate.id)
                          .indexOf(item.categoryId);
                        newCategory.map((cate) => {
                          if (cate.id === item.categoryId) {
                            imageIndex = cate.Image.map(
                              (img) => img.id,
                            ).indexOf(item.id);
                          }
                        });
                        console.log(imageIndex);
                        newCategory[categoryIndex].Image[imageIndex] =
                          editedImage;
                      }

                      setCategories(newCategory);
                      categories[0]?.Image.map((image) => {
                        console.log(image);
                      });
                      // newCategory[categoryIndex].Image.map((image) =>
                      //   dataURItoBlob(image.link.uri),
                      // )
                    }
                  } else {
                    console.log("H");
                  }
                }}
              >
                <Image
                  source={item.link}
                  alt="Image"
                  className="m-2 h-44 w-44 rounded-lg"
                />
              </Pressable>
              <View style={{ position: "absolute", top: 0, right: 0 }}>
                {editButton && isSignedIn && userId === sellerId && (
                  <TouchableHighlight
                    onPress={() => {
                      const editedImage = {
                        id: item.id,

                        link: require("../../../assets/placeholder(3).svg"),
                        categoryId: category.id,
                      };
                      var categoryIndex;
                      var imageIndex;
                      const newCategory = [...categories];
                      if (newCategory !== undefined) {
                        categoryIndex = newCategory
                          .map((cate) => cate.id)
                          .indexOf(category.id);
                        newCategory.map((cate) => {
                          if (cate.id === category.id) {
                            imageIndex = cate.Image.map(
                              (img) => img.id,
                            ).indexOf(item.id);
                          }
                        });
                        console.log(imageIndex);
                        newCategory[categoryIndex].Image[imageIndex] =
                          editedImage;
                      }

                      setCategories(newCategory);
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
          </>
        )}
        numColumns={2}
      />
    </View>
  );
};

export default Categories;
