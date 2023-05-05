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
import { Camera } from "expo-camera";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useAuth } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";

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
  const [pressedImage, setPressedImage] = useState("");
  const [categoryTitle, onChangecategoryTitle] = React.useState("");
  const cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibaryPermission, setHasMediaLibaryPermission] = useState();

  useEffect(() => {
    (async () => {
      const cameraPermissions = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermissions =
        await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermissions.status === "granted");
      setHasMediaLibaryPermission(mediaLibraryPermissions.status === "granted");
    })();
  }, []);
  if (hasCameraPermission === undefined) {
    return <Text>Requesting Permissions...</Text>;
  } else if (!hasCameraPermission) {
    return <Text>Werey Grant am</Text>;
  }
  const [addFormData, setAddFormData] = useState({
    id: (categories?.length || 0) + 1,
    name: "",
    Image: [
      {
        id: 1,
        link: require("../../../assets/placeholder(3).svg"),
      },
      {
        id: 3,
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
      backgroundColor: "black",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 9,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

  return (
    <>
      <View className="mx-auto">
        <SafeAreaView>
          <TextInput
            onChangeText={onChangecategoryTitle}
            value={categoryTitle}
            placeholder="useless placeholder"
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
                  className="m-2 h-44 w-44 "
                />
              </Pressable>
            </>
          )}
          numColumns={2}
        />
      </View>
      <View style={styles.container}>
        <Pressable className="mx-4" style={styles.button}>
          <Text style={styles.buttonText}>Save</Text>
        </Pressable>
        {/* <Pressable
          onPress={() => {
            setAddCategoryButton(false);
          }}
          className="mx-4"
          style={styles.button}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable> */}
      </View>
    </>
  );
};

export default BlankCategories;
