/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import type { Day } from "@prisma/client";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import type { inferRouterOutputs } from "@trpc/server";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  format,
  isEqual,
  isPast,
  isSameMonth,
  parse,
  startOfToday,
} from "date-fns";

import type { AppRouter } from "@acme/api/index";

import Loading from "../../components/Utils/Loading";
import { trpc } from "../../utils/trpc";

type RouterOutput = inferRouterOutputs<AppRouter>;

type TimeSlotsOutput = RouterOutput["appointment"]["getFreeTimeslots"];

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type TimeSlot = ArrayElement<TimeSlotsOutput>;

const BuyerAppointment = ({
  sellerId,
  priceId,
  isOpen,
  closeModal,
  reschedule,
  appointmentId,
}: {
  sellerId: string;
  priceId: string;
  isOpen: boolean;
  closeModal: () => void;
  reschedule?: boolean;
  appointmentId?: string;
}) => {
  const router = useRouter();

  const createAppointment = trpc.appointment.createAppointment.useMutation();
  const rescheduleAppointment =
    trpc.appointment.rescheduleAppointment.useMutation();
  const today = startOfToday();

  const [open, setOpen] = useState(false);

  const [selectedDay, setSelectedDay] = useState(today);
  const getFreeTimeslots = trpc.appointment.getFreeTimeslots.useQuery({
    sellerId: sellerId,
    day: format(selectedDay, "EEEE").toUpperCase() as Day,
    priceId: priceId,
    date: selectedDay,
  });
  const tabBarheight = useBottomTabBarHeight();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>();
  const [userSelectedDay, setUserSelectedDay] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const [selectedMonth, setSelectedMonth] = React.useState(
    firstDayCurrentMonth.toISOString(),
  );
  const utils = trpc.useContext();

  const newDays = eachDayOfInterval({
    start: isSameMonth(today, firstDayCurrentMonth)
      ? today
      : firstDayCurrentMonth,
    end: endOfMonth(
      isSameMonth(today, firstDayCurrentMonth) ? today : firstDayCurrentMonth,
    ),
  });

  useEffect(() => {
    utils.appointment.getFreeTimeslots.invalidate();
  }, [sellerId, priceId]);

  useEffect(() => {
    console.log(currentMonth);
    console.log(newDays);
  }, [currentMonth]);

  useEffect(() => {
    onSelectDate(selectedDay);
  }, []);

  function setCurrentMonthHandler(e: any) {
    setSelectedMonth(e);
    setCurrentMonth(format(new Date(e), "MMM-yyyy"));
  }

  function getMonthsInYear() {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    return eachMonthOfInterval({ start: startOfYear, end: endOfYear });
  }

  async function onSelectTime(time: TimeSlot) {
    console.log(time);

    if (reschedule && appointmentId) {
      rescheduleAppointment.mutate(
        {
          appointmentId: appointmentId,
          date: time.date,
          sellerAvailability: time.availabilityId,
        },
        {
          onSuccess: () => {
            utils.appointment.getAppointments.refetch();
            closeModal();
          },
        },
      );
    } else {
      createAppointment.mutate(
        {
          sellerAvailability: time.availabilityId,
          date: time.date,
          priceId: priceId,
        },
        {
          onSuccess: () => {
            // var windowReference = window.open();
            // windowReference.location.assign(`${env.NEXT_PUBLIC_URL}/profile`)
            // window.open(`${env.NEXT_PUBLIC_URL}/profile`, '_self');
            utils.appointment.getAppointments.invalidate();
            router.push(`/schedule`);
          },
          onError: (err) => {
            //Unreachable
            if (err.data?.code === "UNAUTHORIZED") {
              if (err.message !== "UNAUTHORIZED") {
                Alert.alert(err.message);
              }
            }

            if (err.data?.code === "CONFLICT") {
              Alert.alert(err.message);
            }
          },
        },
      );
    }
  }
  function onSelectDate(day: Date) {
    if (day.toISOString() === selectedDay.toISOString()) {
      setUserSelectedDay(!userSelectedDay);
    } else {
      setUserSelectedDay(true);
    }
    setSelectedDay(day);
  }
  return (
    <>
      <SafeAreaView
        style={{ paddingBottom: tabBarheight }}
        className=" z-0 mx-6 my-auto flex  h-auto rounded-lg bg-[#fafafa]"
      >
        <View className="">
          <View className="px-4">
            <View className=" mb-4 mt-2 flex flex-row items-center">
              <View>
                <Text className="text-3xl  font-medium">Availability in</Text>
              </View>
              <View className="z-30 ml-2 w-32">
                <DropDownPicker
                  open={open}
                  value={selectedMonth}
                  items={getMonthsInYear().map((month) => {
                    return {
                      label: format(month, "MMM"),
                      value: month.toISOString(),
                    };
                  })}
                  setOpen={setOpen}
                  setValue={setSelectedMonth}
                  listMode="MODAL"
                />
              </View>

              {/* <Picker
                className=" mx-4 w-32"
                mode="dropdown"
                onValueChange={(e) => setCurrentMonthHandler(e)}
                selectedValue={selectedMonth}
              >
                {getMonthsInYear().map((month, idx) => (
                  <Picker.Item
                    key={idx}
                    enabled={!isPast(endOfMonth(month))}
                    value={month.toISOString()}
                    label={format(month, "MMM")}
                  />
                ))}
              </Picker> */}
            </View>
          </View>
          <Pressable
            onPress={closeModal}
            className=" absolute -right-1 -top-0 w-4 "
          >
            <Text>✕</Text>
          </Pressable>

          <ScrollView
            className="-z-50 flex-row gap-3 px-3"
            horizontal={true}
            contentOffset={{ x: -20, y: 0 }}
          >
            {newDays.map((day, dayIdx) => (
              <Pressable
                key={day.toString()}
                className={`w-20  flex-shrink-0 justify-center rounded-md p-5 ${
                  isEqual(day, selectedDay)
                    ? "bg-[#1dbaa7] text-[#f2f2f2]"
                    : "border-2"
                }`}
                onPress={() => onSelectDate(day)}
              >
                <Text className="text-center">{format(day, "EE")}</Text>
                <Text className="text-center text-2xl font-bold">
                  {format(day, "d")}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View className=" -z-50 mx-auto">
            {getFreeTimeslots.isLoading ? (
              <Image
                source={require("../../../assets/utils/loader.svg")}
                className="h-5 w-5"
              />
            ) : (
              <>
                <View
                  className={`grid grid-cols-3 flex-row flex-wrap justify-center  ${
                    createAppointment.isLoading ? "opacity-25" : ""
                  } `}
                >
                  <FlatList
                    data={getFreeTimeslots.data}
                    className="p-3"
                    renderItem={({ item, index }) => (
                      <Pressable
                        className={`w-30  mx-auto rounded-xl border-2 p-3 ${
                          index % 3 !== 2 ? "mr-4 pr-4" : ""
                        } ${index % 3 !== 0 ? "ml-4 pl-4" : ""}`}
                        onPress={() => setSelectedTimeSlot(item)}
                      >
                        <Text>
                          {item.date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </Pressable>
                    )}
                    keyExtractor={(item, idx) => idx.toString()}
                    numColumns={3}
                    contentContainerStyle={{
                      alignItems: "flex-start",
                      gap: 16,
                    }}
                  />
                </View>
                {getFreeTimeslots.data?.length === 0 && (
                  <View className="mx-auto p-3 text-center text-3xl font-bold">
                    <Text>NO TIME SLOTS</Text>
                  </View>
                )}
              </>
            )}
          </View>
          {selectedTimeSlot && (
            <Fragment>
              <View
                className=" mx-4 flex flex-row items-center justify-between 
							"
              >
                <View>
                  <Text className="text-xl font-semibold">
                    {format(selectedTimeSlot.date, "MMM dd hh:mma")}
                  </Text>
                </View>
                <Pressable
                  className={`flex items-center rounded-lg bg-[#1dbaa7] p-3  ${
                    createAppointment.isLoading ? "btn-disabled" : "btn-primary"
                  }`}
                  disabled={
                    createAppointment.isLoading ||
                    rescheduleAppointment.isLoading
                  }
                  onPress={() => onSelectTime(selectedTimeSlot)}
                >
                  {createAppointment.isLoading ? (
                    <Loading loading={createAppointment.isLoading} />
                  ) : (
                    <Text className="font-semibold text-[#F2f2f2]">
                      CONFIRM?
                    </Text>
                  )}
                </Pressable>
              </View>
              <View className="mx-4 text-xs  ">
                <Text className="w-48 text-xs font-bold text-[#EBA937]">
                  Note: Appointment still requires seller approval
                </Text>
              </View>
            </Fragment>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default BuyerAppointment;
