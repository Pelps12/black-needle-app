import React, { useRef, useState } from "react";
import {
  Button,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import AnimatedLottieView from "lottie-react-native";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import FormTextInput from "../components/Utils/FormTextInput";
import SKTest from "../components/Utils/SKText";
import SKText from "../components/Utils/SKText";
import SKTextInput from "../components/Utils/SKTextInput";
import { trpc } from "../utils/trpc";

const formSchema = z.object({
  image: z.string().optional(),
  username: z.string(),
});
export type ProfileFormSchemaType = z.infer<typeof formSchema>;

const Profile = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { control, handleSubmit } = useForm<ProfileFormSchemaType>({
    resolver: zodResolver(formSchema),
  });
  const [image, setImage] = useState<string>();
  const { signOut } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const animation = useRef<AnimatedLottieView>(null);
  const getSession = trpc.auth.getSession.useQuery();

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

  const onSubmit: SubmitHandler<ProfileFormSchemaType> = (data) => {
    console.log(data);
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
  return (
    <View className="">
      <View className="flex-row justify-between">
        <View>
          <SKTest className="mx-3 text-4xl font-bold" fontWeight="semi-bold">
            Profile
          </SKTest>
        </View>

        <View className="">
          {!editMode ? (
            <Pressable
              className={`mx-3   flex flex-row  content-center items-center justify-center rounded-lg bg-[#1dbaa7] px-3 py-1  shadow-sm`}
              onPress={() => setEditMode(true)}
            >
              <SKTest className="text-lg font-semibold text-white">Edit</SKTest>
            </Pressable>
          ) : (
            <View className="mx-3 flex-row gap-2">
              <Pressable onPress={handleSubmit(onSubmit)}>
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
          <FormTextInput
            className="hidden w-auto rounded-md   border-b p-0.5 text-2xl font-semibold"
            fontWeight="semi-bold"
            defaultValue={user?.profileImageUrl}
            name="image"
            value={image}
            control={control}
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
                  {user?.username ?? user?.fullName ?? "Unknown"}
                </SKText>
              ) : (
                <FormTextInput
                  className="w-auto rounded-md border-b   p-0.5 text-2xl font-semibold"
                  fontWeight="semi-bold"
                  defaultValue={user?.username ?? user?.fullName ?? "Unknown"}
                  name="username"
                  control={control}
                />
              )}
            </>
          )}
        </View>
      </View>

      <Pressable
        className={`mx-auto my-2 flex flex-row  content-center items-center justify-center rounded-lg bg-[#1dbaa7] px-5 py-3  shadow-sm`}
        onPress={() => signOut().catch((err) => console.log(err))}
      >
        <SKTest className="text-xl font-semibold text-white">Sign Out</SKTest>
      </Pressable>
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
