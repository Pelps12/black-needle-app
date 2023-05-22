// @ts-nocheck
import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Constants from "expo-constants";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@clerk/clerk-expo";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import dataURItoBlob from "../../utils/dataURItoBlob";
import { trpc } from "../../utils/trpc";
import Modal from "../Modal";

const BlankCategories = ({ setAddCategoryButton, categories }) => {
  return (
    <>
      <BlankCategory
        setAddCategoryButton={setAddCategoryButton}
        categories={categories}
      ></BlankCategory>
    </>
  );
};

// here
const BlankCategory = ({ setAddCategoryButton, categories }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pressedImage, setPressedImage] = useState("");
  const [categoryTitle, onChangecategoryTitle] = React.useState("");
  const [selectedImage, setImage] = useState("");
  const [disableSaveButton, setDisableSaveButton] = useState(true);
  const [numberOfImages, setNumberOfImages] = useState(0);
  const createCate = trpc.user.createCategory.useMutation();

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
  const [addFormData, setAddFormData] = useState({
    // id: (categories?.length || 0) + 1,
    name: "",
    Image: [
      {
        id: 1,
        link: require("../../../assets/placeholder(3).svg"),
      },
      {
        id: 2,
        link: require("../../../assets/placeholder(3).svg"),
      },
      {
        id: 3,
        link: require("../../../assets/placeholder(3).svg"),
      },
      {
        id: 4,
        link: require("../../../assets/placeholder(3).svg"),
      },
    ],
  });

  useEffect(() => {
    console.log("Number of images: " + numberOfImages);
    setNumberOfImages(numberOfImages);
  }, [numberOfImages]);
  // check if imageurl is not null
  const imageUploading = async (item) => {
    // alert(item);

    const imageUrl = await pickImageAsync();
    if (imageUrl) {
      const updatedFormData = {
        ...addFormData,
        Image: addFormData.Image.map((img) => {
          if (img.id === item) {
            return {
              ...img,
              link: imageUrl,
            };
          } else {
            return img;
          }
        }),
      };

      setAddFormData(updatedFormData);
    }
  };
  const imageUpload = async (files) => {
    console.log("Welcome");
    const formData = new FormData();
    formData.append(
      "UPLOADCARE_PUB_KEY",
      Constants.expoConfig?.extra?.NEXT_PUBLIC_UPLOADCARE_PUB_KEY,
    );
    formData.append("UPLOADCARE_STORE", "auto");

    // formData.append("metadata[user]", uid);
    console.log("Are you there");
    files.forEach((file, index) => {
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
    console.log("Yes i am");

    console.log("sleep");
    console.log(formData);
    console.log("Ojo");
    const response = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  };
  const checkInputBoxChange = (newTitle) => {
    onChangecategoryTitle(newTitle);
    if (newTitle.length > 0) {
      setDisableSaveButton(false);
    } else {
      setDisableSaveButton(true);
    }
    const newCategory = { ...addFormData };
    newCategory.name = newTitle;

    setAddFormData(newCategory);
  };

  const submitImageAndTitle = async () => {
    console.log("head");
    addFormData.Image.map((image) => console.log(image.link));
    const getFileObjects = async () => {
      return Promise.all(
        addFormData.Image.map((image) => dataURItoBlob(image.link.uri)),
      );
    };

    const files = await getFileObjects();
    console.log(files);
    console.log("leg");
    if (files.length > 0) {
      console.log("About to log file");
      console.log(files);
      console.log("Afterr");
      const response = await imageUpload(
        addFormData.Image.map((image) => image.link),
      );
      if (response.ok) {
        console.log(response);
        console.log("bellyHUU");
        const result = await response.json();
        console.log(result);
        console.log("hellyyHUU");
        createCate.mutateAsync({
          name: addFormData.name,
          images: Object.keys(result).map(
            (image) => `https://ucarecdn.com/${result[image]}/`,
          ),
        });
      } else {
        console.log(await response.text(), response.status);
      }
      console.log("nose");
    }
  };
  const styles = StyleSheet.create({
    container: {
      marginTop: -40,
      flexDirection: "row",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    button: {
      backgroundColor: disableSaveButton ? "#607D8B" : "black",
      marginLeft: 150,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 9,
      width: 90,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

  return (
    <>
      {/* <View>
        <View>
          <Button
            color="primary"
            title="Choose a photo"
            onPress={pickImageAsync}
          />
          <Button title="Use this photo" />
        </View>
      </View> */}
      <View className="mx-auto">
        <SafeAreaView>
          <TextInput
            onChangeText={(newTitle) => checkInputBoxChange(newTitle)}
            value={categoryTitle}
            placeholder="Category Name"
            keyboardType="default"
            className="w-48 border-2"
          />
        </SafeAreaView>
        <FlatList
          data={addFormData.Image}
          className="mx-auto"
          ListFooterComponent={<View style={{ height: 40 }} />}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <>
              <Pressable onPress={() => imageUploading(item.id)}>
                <Image
                  source={item.link.uri ? item.link.uri : item.link}
                  alt="Image"
                  style={{ width: 176, height: 176 }}
                  className="m-2 h-44 w-44 "
                />
              </Pressable>
            </>
          )}
          numColumns={2}
        />
      </View>
      <View>
        <Pressable
          disabled={disableSaveButton}
          className="mx-4"
          style={styles.button}
          onPress={submitImageAndTitle}
        >
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
      </View>
    </>
  );
};

export default BlankCategories;
