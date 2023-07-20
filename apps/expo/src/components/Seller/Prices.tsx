import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

import { type Category, type Price, type Image as PrismaImage } from "@acme/db";

import SKTest from "../../components/Utils/SKText";
import { trpc } from "../../utils/trpc";
import Modal from "../Modal";
import AddPricesModal from "./AddPricesModal";
import AppointmentModal from "./AppointmentModal";
import EditPricesModal from "./EditPricesModal";

const Prices = ({
  prices,
  sellerId,
  categories,
  setCategories,
}: {
  categories: (Category & {
    Image: PrismaImage[];
    prices: Price[];
  })[];
  prices: (Category & {
    prices: Price[];
    Image: PrismaImage[];
  })[];
  sellerId: string;
  setCategories: any;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { userId, isSignedIn } = useAuth();
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const router = useRouter();
  const [openEditModal, setOpenEditModal] = useState(false);
  const getCat = trpc.user.getCategories.useQuery(
    {
      id: sellerId,
    },
    // {
    //   refetchInterval: undefined,
    //   enabled: false,
    // },
  );

  return (
    <View className=" mt-2">
      {isSignedIn && userId === sellerId ? (
        <>
          <Modal
            modalVisible={priceModalVisible}
            setModalVisible={setPriceModalVisible}
            className=""
          >
            <AddPricesModal
              getCat={getCat}
              setCategories={setCategories}
              prices={prices}
              categories={categories}
              closeModal={() => setPriceModalVisible(false)}
            />
          </Modal>
          <Pressable
            onPress={() => {
              isSignedIn
                ? setPriceModalVisible(true)
                : router.replace("auth/signin");
            }}
          >
            <Feather
              name="plus-circle"
              style={{ marginLeft: 350, marginBottom: 5 }}
              size={24}
              color="black"
            />
          </Pressable>
        </>
      ) : null}
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
                categories={categories}
                setOpenEditModal={setOpenEditModal}
                openEditModal={openEditModal}
                setCategories={setCategories}
                getCat={getCat}
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
  getCat,
  setCategories,
  setOpenEditModal,
  openEditModal,
  categories,
}: {
  categories: (Category & {
    Image: PrismaImage[];
    prices: Price[];
  })[];
  price: Price;
  image?: PrismaImage;
  modalVisible: boolean;
  setModalVisible: (modalVisible: boolean) => void;
  sellerId: string;
  getCat: any;
  setCategories: any;
  setOpenEditModal: any;
  openEditModal: any;
}) => {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const catDeletePrice = trpc.price.deletePrice.useMutation();

  const [editPriceModalVisible, setEditPriceModalVisible] = useState(false);

  return (
    <>
      <View className=" mx-2 my-5 mt-2 flex-row items-center  justify-between rounded-lg px-2 py-4 shadow-lg">
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
            onPress={() =>
              isSignedIn ? setModalVisible(true) : router.replace("auth/signin")
            }
          >
            <SKTest
              className="text-md px-4 py-2 text-center font-semibold text-white"
              fontWeight="semi-bold"
            >
              Book
            </SKTest>
          </Pressable>
          <View>
            {isSignedIn && sellerId === userId ? (
              <>
                <View className="flex-row gap-3">
                  <Modal
                    modalVisible={editPriceModalVisible}
                    setModalVisible={setEditPriceModalVisible}
                  >
                    <EditPricesModal
                      getCat={getCat}
                      setCategories={setCategories}
                      categories={categories}
                      price={price}
                      closeModal={() => setEditPriceModalVisible(false)}
                    ></EditPricesModal>
                  </Modal>

                  <Pressable
                    onPress={() => {
                      setOpenEditModal(!openEditModal);
                      console.log(price);

                      setEditPriceModalVisible(!editPriceModalVisible);
                    }}
                  >
                    <Feather style={{}} name="edit-2" size={24} color="black" />
                  </Pressable>
                  <Pressable
                    onPress={async () => {
                      await catDeletePrice.mutateAsync(
                        {
                          priceId: price.id,
                        },
                        {
                          onSuccess: async () => {
                            const { data, isSuccess } = await getCat.refetch();
                            if (isSuccess) {
                              setCategories(data?.user?.seller?.Category);
                            }
                          },
                        },
                      );
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
              </>
            ) : null}
          </View>
        </View>
      </View>
    </>
  );
};
