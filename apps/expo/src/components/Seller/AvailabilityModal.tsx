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
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import {
  addDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isEqual,
  isPast,
  isSameMonth,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns";

import type { Day, SellerAvailability } from "@acme/db";

import { trpc } from "../../utils/trpc";
import ShowAvailabilityList from "./ShowAvailabilityList";

const AvailabilityModal = ({ sellerId }) => {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const [selectedDay, setSelectedDay] = useState(today);
  const [userSelectedDay, setUserSelectedDay] = useState(false);
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const [isCreateButtonEnabled, setIsCreateButtonEnabled] = useState(false);

  const getSellerAvailabilty = trpc.appointment.getSellerAvailabilty.useQuery(
    {
      sellerId: sellerId,
      day: format(selectedDay, "EEEE").toUpperCase() as Day,
    },
    {
      refetchInterval: undefined,
      enabled: true,
      staleTime: undefined,
    },
  );
  const [selectedMonth, setSelectedMonth] = React.useState(
    firstDayCurrentMonth.toISOString(),
  );

  function onSelectDate(day: Date) {
    getSellerAvailabilty.refetch();
    if (day.toISOString() === selectedDay.toISOString()) {
      setUserSelectedDay(!userSelectedDay);
    } else {
      setUserSelectedDay(true);
    }
    setSelectedDay(day);
  }
  const newDays = eachDayOfInterval({
    start: isSameMonth(today, firstDayCurrentMonth)
      ? today
      : firstDayCurrentMonth,
    end: endOfMonth(
      isSameMonth(today, firstDayCurrentMonth) ? today : firstDayCurrentMonth,
    ),
  });
  const daysOfWeek = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(today, i);
    daysOfWeek.push(day);
  }
  //   const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  //   const daysOfWeek = [];
  //   for (let i = 0; i < 7; i++) {
  //     const day = addDays(weekStart, i);
  //     daysOfWeek.push(day);
  //   }
  //   const currentDayIndex = daysOfWeek.findIndex(
  //     (day) => format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd"),
  //   );
  //   if (currentDayIndex > 0) {
  //     const daysFromStartToEnd = daysOfWeek.splice(currentDayIndex);
  //     daysOfWeek.unshift(...daysFromStartToEnd);
  //   }
  const [sellerAvailability, setSellerAvailability] = useState<
    SellerAvailability[]
  >([]);

  useEffect(() => {
    let newArray = [];
    var i = 0;
    var j = 0;
    while (
      getSellerAvailabilty.data &&
      getSellerAvailabilty.data != undefined &&
      i < getSellerAvailabilty.data.length
    ) {
      console.log(getSellerAvailabilty.data[i]);
      const obj = {
        from: getSellerAvailabilty?.data[i]?.from,
        to: getSellerAvailabilty?.data[i]?.to,
        id: getSellerAvailabilty?.data[i]?.id,
      };

      newArray.push(obj);
      i++;
    }

    // console.log(newArray);
    setSellerAvailability(newArray);
  }, [getSellerAvailabilty.data]);
  useEffect(() => {
    // console.log(currentMonth);
    // console.log(newDays);
  }, [currentMonth]);
  useEffect(() => {
    onSelectDate(selectedDay);
  }, []);
  return (
    <SafeAreaView className=" z-0 mx-6 my-auto flex  h-auto rounded-lg bg-[#fafafa]">
      <View className="">
        <View className="px-4">
          <View className=" mb-4 mt-2 flex flex-row items-center">
            <View>
              <Text className="text-3xl  font-medium">Set Availability </Text>
            </View>
            <View className="z-30 ml-2 w-32"></View>
          </View>
          <ScrollView
            className="-z-50 flex-row gap-3 px-3"
            horizontal={true}
            contentOffset={{ x: -20, y: 0 }}
          >
            {daysOfWeek.map((day, dayIdx) => (
              <Pressable
                key={day.toString()}
                className={`w-20  flex-shrink-0 justify-center rounded-md p-5 ${
                  isEqual(day, selectedDay)
                    ? "bg-[#1dbaa7] text-[#f2f2f2]"
                    : "border-2"
                }`}
                onPress={() => onSelectDate(day)}
              >
                <Text className="text-1xl text-center font-bold">
                  {format(day, "EE")}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
      <View className=" -z-50 mx-6 flex p-2">
        <View className=" flex-row justify-start space-x-48">
          <View className=" flex-row space-x-4 ">
            <Text className="text-1xl font-bold">From </Text>
            <Text className="text-1xl font-bold">To</Text>
          </View>
          <View className="">
            <Pressable
              onPress={() => {
                setIsCreateButtonEnabled(!isCreateButtonEnabled);
              }}
            >
              <Feather name="plus-circle" size={19} color="black" />
            </Pressable>
          </View>
        </View>
        <View className="flex  p-2">
          <ShowAvailabilityList
            setIsCreateButtonEnabled={setIsCreateButtonEnabled}
            isCreateButtonEnabled={isCreateButtonEnabled}
            selectedDay={selectedDay}
            setSellerAvailability={setSellerAvailability}
            getSellerAvailabilty={sellerAvailability}
            sellerAvailability={sellerAvailability}
            sellerId={sellerId}
          ></ShowAvailabilityList>
          {/* <FlatList
            contentContainerStyle={{ paddingBottom: 20 }}
            ListFooterComponent={<View style={{ height: 320 }} />}
            data={sellerAvailability}
            ItemSeparatorComponent={() => (
              <View className="border-b-2 border-[#ddd]" />
            )}
            renderItem={({ item: freePeriod }) => (
              <ShowAvailabilityList
                setSellerAvailability={setSellerAvailability}
                getSellerAvailabilty={freePeriod}
                sellerAvailability={sellerAvailability}
                sellerId={sellerId}
              ></ShowAvailabilityList>
            )}
            keyExtractor={(item) => item?.id.toString()}
          /> */}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AvailabilityModal;
