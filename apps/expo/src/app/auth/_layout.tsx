import { Stack } from "expo-router";

import AuthHeader from "../../components/Layout/AuthHeader";

export default function Layout() {
  return (
    <Stack
      initialRouteName="signin"
      screenOptions={{
        header: (props) => <AuthHeader {...props} />,
        headerShadowVisible: false,
      }}
    />
  );
}
