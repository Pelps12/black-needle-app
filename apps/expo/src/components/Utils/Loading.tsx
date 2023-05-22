import React, { useRef } from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";
import AnimatedLottieView from "lottie-react-native";

const Loading: React.FC<{ loading: boolean }> = ({ loading }) => {
  const animation = useRef<AnimatedLottieView>(null);
  return (
    <>
      {loading ? (
        <View className="mx-auto">
          <LottieView
            autoPlay
            ref={animation}
            style={{
              width: 200,
              height: 200,
              backgroundColor: "#f2f2f2",
            }}
            // Find more Lottie files at https://lottiefiles.com/featured
            source={require("../../../assets/animations/loading.json")}
          />
        </View>
      ) : (
        <></>
      )}
    </>
  );
};

export default Loading;
