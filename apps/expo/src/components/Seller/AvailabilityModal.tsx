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

const AvailabilityModal = () => {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const [selectedDay, setSelectedDay] = useState(today);
  const [userSelectedDay, setUserSelectedDay] = useState(false);
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const [selectedMonth, setSelectedMonth] = React.useState(
    firstDayCurrentMonth.toISOString(),
  );

  function onSelectDate(day: Date) {
    if (day.toISOString() === selectedDay.toISOString()) {
      setUserSelectedDay(!userSelectedDay);
    } else {
      setUserSelectedDay(true);
    }
    setSelectedDay(day);
    console.log(day);
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

  useEffect(() => {
    console.log(currentMonth);
    console.log(newDays);
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
            <Feather name="plus-circle" size={17} color="black" />
          </View>
        </View>
        <View className="flex  p-2">
          <Text>CONTENT HERE</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AvailabilityModal;
