import { View } from "react-native";
import { Tabs } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";

import Header from "../../components/header";

const HomeLayout = () => {
  const { isSignedIn, isLoaded } = useUser();
  return (
    <Tabs
      sceneContainerStyle={{
        backgroundColor: "#f2f2f2",
      }}
      backBehavior={"history"}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#F2F2F2",
        },
        tabBarBackground: () => <View className="bg-[#F2f2f2]" />,
        headerShadowVisible: false,
        header: (props) => <Header {...props} />,

        tabBarStyle: {
          backgroundColor: "#d9d9d9",
          height: 80,
        },
        tabBarIconStyle: {
          marginTop: 10,
          color: "#000",
          padding: 0,
        },
        tabBarActiveTintColor: "#1dbaa7",
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabelStyle: {
            display: "none",
          },
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarLabelStyle: {
            display: "none",
          },
          tabBarIcon: ({ color }) => (
            <AntDesign name="clockcircleo" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabelStyle: {
            display: "none",
          },
          tabBarIcon: ({ color }) => (
            <AntDesign name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default HomeLayout;
