import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

import { type Category, type Price, type Image as PrismaImage } from "@acme/db";

import SKTest from "../../components/Utils/SKText";
import Modal from "../Modal";
import AppointmentModal from "./AppointmentModal";

const Prices = ({
  prices,
  sellerId,
}: {
  prices: (Category & {
    prices: Price[];
    Image: PrismaImage[];
  })[];
  sellerId: string;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View className=" mt-2">
      <FlatList
        contentContainerStyle={{ paddingBottom: 20 }}
        ListFooterComponent={<View style={{ height: 320 }} />}
        data={prices}
        ItemSeparatorComponent={() => (
          <View className="border-b-2 border-[#ddd]" />
        )}
        renderItem={({ item: category }) => (
          <FlatList
            data={category.prices}
            ItemSeparatorComponent={() => (
              <View className="border-b-2 border-[#ddd]" />
            )}
            renderItem={({ item }) => (
              <PriceComponent
                price={item}
                image={category.Image[0]}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                sellerId={sellerId}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
          ></FlatList>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default Prices;

const PriceComponent = ({
  price,
  image,
  modalVisible,
  setModalVisible,
  sellerId,
}: {
  price: Price;
  image: PrismaImage | undefined;
  modalVisible: boolean;
  setModalVisible: (modalVisible: boolean) => void;
  sellerId: string;
}) => {
  return (
    <View className="mx-2 my-5 mt-2 flex-row items-center  justify-between rounded-lg px-2 py-4 shadow-lg">
      <Modal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        className=""
      >
        <AppointmentModal
          sellerId={sellerId}
          priceId={price.id}
          isOpen={modalVisible}
          closeModal={() => setModalVisible(false)}
        />
      </Modal>
      <Image source={image?.link ?? ":)"} className="h-40 w-40 rounded-md" />
      <View className="flex w-48 items-end">
        <SKTest
          className=" text-right text-xl font-semibold"
          fontWeight="semi-bold"
        >
          {price.name}
        </SKTest>
        <SKTest className="text-right" fontWeight="semi-bold">
          ${price.amount}
        </SKTest>
        <Pressable
          className={`my-2 w-24 content-center items-center justify-center  rounded-md bg-[#1dbaa7] text-right   text-black shadow-sm`}
          onPress={() => setModalVisible(true)}
        >
          <SKTest
            className="text-md px-4 py-2 text-center font-semibold text-white"
            fontWeight="semi-bold"
          >
            Book
          </SKTest>
        </Pressable>
      </View>
    </View>
  );
};
