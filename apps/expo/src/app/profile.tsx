import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Link, useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import AnimatedLottieView from "lottie-react-native";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import FormTextInput from "../components/Utils/FormTextInput";
import ProtectedLink from "../components/Utils/ProtectedLink";
import SKTest from "../components/Utils/SKText";
import SKText from "../components/Utils/SKText";
import SKTextInput from "../components/Utils/SKTextInput";
import dataURItoBlob from "../utils/dataURItoBlob";
import { trpc } from "../utils/trpc";
import { openBrowserAsync } from "expo-web-browser";
import Constants from "expo-constants";

const formSchema = z.object({
  image: z.string().optional(),
  username: z.string(),
});
export type ProfileFormSchemaType = z.infer<typeof formSchema>;

const Profile = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [image, setImage] = useState<string | undefined>(user?.imageUrl);
  const [username, setUsername] = useState<string | null | undefined>(
    user?.username ?? user?.fullName,
  );
  const { signOut } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const animation = useRef<AnimatedLottieView>(null);
  const getSession = trpc.auth.getSession.useQuery();
  const updateUser = trpc.user.updateUser.useMutation();
  const deleteUser = trpc.user.deleteUser.useMutation();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]?.uri);
    }
  };

  const handleSubmit = async (e: GestureResponderEvent) => {
    console.log(image, username);
    if (user) {
      let uriParts = image?.split(".");
      let fileType = uriParts && uriParts[uriParts.length - 1];
      const file = image ? await dataURItoBlob(image) : null;
      console.log(file?.size);
      const formdata = new FormData();
      if(file){
        formdata.append("userId", user.id)
        formdata.append("file", file)
      }
      const [userResult, imageResult] = await Promise.all([
        username
          ? updateUser.mutateAsync({
              username: username,
            })
          : [],
        file
          ? fetch(`${Constants.expoConfig?.extra?.PUBLIC_URL as string}/api/clerk/profile`,{
            method: "POST",
            body: formdata
          })
          : [],
      ]);
      if(file) {
        (imageResult as Response).json().then((result: any) => console.log(result))
      }
      setImage(undefined);
      setUsername(undefined);
      user.reload();
    }
  };

  const handleProfilePicChange = () => {
    if (editMode) {
      pickImage();
    }
  };

  const handleEditCancel = () => {
    setImage(undefined);
    setEditMode(false);
  };
  const handleSignOut = () => {
    signOut()
      .then(() =>
        router.push({
          pathname: "auth/signin",
        }),
      )
      .catch((err) => console.log(err));
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      "Account Deletion",
      "Going forward with this will delete your account from Sakpa",
      [
        {
          text: "Cancel",
        },
        {
          text: "Proceed",
          onPress: async () => {
            await deleteUser.mutateAsync();
            handleSignOut();
          },
        },
      ],
    );
  };

  useEffect(() => {
    console.log(username)
  }, [editMode])

  const _handlePressButtonAsync = async () => {
    await openBrowserAsync(`${Constants.expoConfig?.extra?.PUBLIC_URL as string}/register/seller?intiator=app`);
  };
  return (
    <View className="">
      <View className="flex-row justify-between">
        <View>
          <SKTest className="mx-3 text-4xl font-bold" fontWeight="semi-bold">
            Profile
          </SKTest>
        </View>

        <View className="items-center">
          {!editMode ? (
            <Pressable
              className={`mx-3   flex flex-row  content-center items-center justify-center rounded-lg bg-[#1dbaa7] px-3 py-1  shadow-sm`}
              onPress={() => setEditMode(true)}
            >
              <SKTest className="text-lg font-semibold text-white">Edit</SKTest>
            </Pressable>
          ) : (
            <View className="mx-3 flex-row gap-2">
              <Pressable onPress={(e) => handleSubmit(e)}>
                <AntDesign name="save" size={30} color="#1dbaa7" />
              </Pressable>

              <Pressable onPress={handleEditCancel}>
                <MaterialCommunityIcons
                  name="cancel"
                  size={30}
                  color="#E26850"
                />
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <View className="mx-3 max-w-md items-center justify-start gap-3">
        <Pressable onPress={handleProfilePicChange}>
          {/* Temporary */}
          <Image
            source={image ?? user?.profileImageUrl}
            className="h-20 w-20 rounded-xl "
            placeholder={require("../../assets/placeholder.png")}
          />
          <SKTextInput
            className="hidden w-auto rounded-md   border-b p-0.5 text-2xl font-semibold"
            fontWeight="semi-bold"
            defaultValue={user?.profileImageUrl}
            value={image}
            onChangeText={(e) => setImage(e)}
          />
          {editMode && (
            <View className="absolute -bottom-2.5 -right-2.5 rounded-lg  ">
              <MaterialCommunityIcons
                name="pencil-circle"
                size={24}
                color="#72a2f9"
              />
            </View>
          )}
        </Pressable>
        <View className="mx-2">
          {!isLoaded ? (
            <Image
              className="mr-2 h-10 w-48 rounded-xl shadow-sm"
              source={require("../../assets/placeholder.png")}
            />
          ) : (
            <>
              {!editMode ? (
                <SKText
                  className=" max-w-xs p-0.5 text-2xl font-semibold"
                  fontWeight="semi-bold"
                >
                  {user?.username ?? user?.fullName ?? "No Name"}
                </SKText>
              ) : (
                <SKTextInput
                  className="w-auto rounded-md border-b p-0.5 text-2xl font-semibold text-black"
                  fontWeight="semi-bold"
                  defaultValue={user?.username ?? user?.fullName ?? "Unknown"}
                  value={username ?? ""}
                  onChangeText={(e) => setUsername(e)}
                />
              )}
            </>
          )}
        </View>
      </View>

      <View>
        {user?.publicMetadata?.role === "SELLER" ? (
          <View className="mx-auto my-2 flex flex-row  content-center items-center justify-center rounded-lg bg-[#72a2f9] px-3 py-1  shadow-sm">
            <ProtectedLink href={`/seller/${user.id}`} asChild={true}>
              <SKTest className="text-lg font-semibold text-white">
                Seller Page
              </SKTest>
            </ProtectedLink>
          </View>
        ) : (
          <View className="mx-auto my-2 flex flex-row  content-center items-center justify-center rounded-lg bg-[#72a2f9] px-3 py-1  shadow-sm">
            <Pressable onPress={_handlePressButtonAsync}>
              <SKTest className="text-lg font-semibold text-white">
                Become a Seller
              </SKTest>
            </Pressable>
          </View>
        )}

        <Pressable
          className={`mx-auto my-2 flex flex-row  content-center items-center justify-center rounded-lg bg-[#1dbaa7] px-3 py-1  shadow-sm`}
          onPress={() => handleSignOut()}
        >
          <SKTest className="text-lg font-semibold text-white">Sign Out</SKTest>
        </Pressable>

        <Pressable
          className={`mx-auto my-2 flex flex-row  content-center items-center justify-center rounded-lg bg-[#E26850] px-3 py-1  shadow-sm`}
          onPress={() => handleAccountDeletion()}
        >
          <SKTest className="text-lg font-semibold text-white">
            Delete Account
          </SKTest>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonContainer: {
    paddingTop: 20,
  },
});

export default Profile;
