import React from "react";
import { Stack } from "expo-router";

const ScheduleLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="payment" options={{ presentation: "modal" }} />
    </Stack>
  );
};

export default ScheduleLayout;
