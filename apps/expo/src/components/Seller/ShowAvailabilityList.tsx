import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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

import type { Day } from "@acme/db";

import { trpc } from "../../utils/trpc";

const SECONDS_IN_HOUR = 3600;
let newSellerArray = [];
function convertSecondsToTime(seconds) {
  const hours = Math.floor(seconds / SECONDS_IN_HOUR);
  const remainingSeconds = seconds % SECONDS_IN_HOUR;

  const formatNumber = (number) => `0${number}`.slice(-2); // Adds leading zeros if needed

  const date = new Date();
  date.setHours(
    hours,
    Math.floor(remainingSeconds / 60),
    remainingSeconds % 60,
  );

  const hour = formatNumber(date.getHours());
  const minute = formatNumber(date.getMinutes());

  return { hour, minute };
}
const ShowAvailabilityList = ({
  sellerAvailability,
  setSellerAvailability,
  sellerId,
  getSellerAvailabilty,
  selectedDay,
  isCreateButtonEnabled,
  setIsCreateButtonEnabled,
}) => {
  const changeNameById = (id, newName) => {
    showDatePicker();
    setSellerAvailability((prevData) => {
      return prevData.map((item) => {
        if (item.id === id) {
          return { ...item, from: newName };
        }
        return item;
      });
    });
  };
  const editSellerAvailability =
    trpc.appointment.editSellerAvailibility.useMutation();
  const [editedTime, setEditedTime] = useState<any[]>([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const createAvailiability = trpc.user.createNewAvailability.useMutation();
  const deleteSellerAvailability =
    trpc.appointment.deleteSellerAvailability.useMutation();

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
    hideDatePicker();
  };
  const [inputSeconds, setInputSeconds] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const [time, setTime] = useState(new Date());
  const [enableNewAvailabilitySave, setEnableNewAvailabilitySave] =
    useState(false);

  const pleaseSetTime = (timing) => {
    setTime(timing);
  };
  const convertSeconds = (yo) => {
    const totalSeconds = inputSeconds;
    const defaultTime = new Date();
    const hours = Math.floor(yo / 3600);
    const minutes = Math.floor((yo % 3600) / 60);
    defaultTime.setHours(hours);
    defaultTime.setMinutes(minutes);
    // pleaseSetTime(defaultTime);
    // setHours(hours);
    // setMinutes(minutes);
    return time;
  };

  // const returnCorTime = (from) => {
  //   setTime(convertSeconds(from));
  //   return time;
  // };

  const [showTimePicker, setShowTimePicker] = useState(false);
  useEffect(() => {
    let newArray = [];
    var i = 0;
    var j = 0;

    while (
      sellerAvailability &&
      sellerAvailability != undefined &&
      i < sellerAvailability.length
    ) {
      // console.log(sellerAvailability[i]);

      const fromDefaultTime = new Date();
      const fromHours = Math.floor(sellerAvailability[i]?.from / 3600);
      const fromMinutes = Math.floor((sellerAvailability[i]?.from % 3600) / 60);

      fromDefaultTime.setHours(fromHours);
      fromDefaultTime.setMinutes(fromMinutes);
      const toDefaultTime = new Date();
      const toHours = Math.floor(sellerAvailability[i]?.to / 3600);
      const toMinutes = Math.floor((sellerAvailability[i]?.to % 3600) / 60);
      console.log("Ojo" + " " + fromMinutes);
      toDefaultTime.setHours(toHours);
      toDefaultTime.setMinutes(toMinutes);
      const obj = {
        from: fromDefaultTime,
        to: toDefaultTime,
        id: sellerAvailability[i]?.id,
      };

      newArray.push(obj);
      i++;
    }
    setEditedTime(newArray);
  }, [sellerAvailability]);

  const [dateSelected, setDateSelected] = useState(false);
  const [newAvailabilityFromDate, setNewAvailabilityFrom] = useState(
    new Date(),
  );
  const [newAvailabilityToDate, setNewAvailabilityTo] = useState(new Date());
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [newAvailabilityObject, setNewAvailabilityObject] = useState<{
    id: number;
    from: Date | null;
    to: Date | null;
  }>({
    id: 0,
    from: null,
    to: null,
  });

  const [selectedItemId, setSelectedItemId] = useState(null);
  // const handleTimeChange = (event, selectedTime) => {
  //   if (selectedTime) {
  //     const updatedTimes = editedTime.map((item) =>
  //       item.id === selectedItemId ? { ...item, time: selectedTime } : item
  //     );
  //     setTimes(updatedTimes);
  //   }
  //   setShowTimePicker(false);
  // };
  console.log(editedTime);
  const editFromById = (dataArray, targetId, newFromDate) => {
    setDateSelected(true);
    setEditedTime(
      dataArray.map((item) =>
        item.id === targetId ? { ...item, from: newFromDate } : item,
      ),
    );
  };
  const editToById = (dataArray, targetId, newToDate) => {
    setDateSelected(true);
    setEditedTime(
      dataArray.map((item) =>
        item.id === targetId ? { ...item, to: newToDate } : item,
      ),
    );
  };
  const convertTimeBackToSeconds = (hours, minutes) => {
    if (typeof hours !== "number" || typeof minutes !== "number") {
      throw new Error("Invalid input. Hours and minutes must be numbers.");
    }

    // Convert hours and minutes to seconds
    const totalSeconds = hours * 3600 + minutes * 60;
    return totalSeconds;
  };
  const onChange = (event, selectedTime, dataArray, targetId) => {
    console.log(selectedTime);
    editFromById(dataArray, targetId, selectedTime);
    setSelectedItemId(targetId);
    setShowSaveButton(true);
    // const currentTime = selectedTime || time;
    // setShowTimePicker(false);
    // setTime(currentTime);
  };
  const onChangeTo = (event, selectedTime, dataArray, targetId) => {
    console.log(selectedTime);
    editToById(dataArray, targetId, selectedTime);
    setSelectedItemId(targetId);
    setShowSaveButton(true);
    // const currentTime = selectedTime || time;
    // setShowTimePicker(false);
    // setTime(currentTime);
  };

  const onNewFromAvailabilityChange = (event, selectedTime) => {
    const renewDate = new Date();
    const currentTime = selectedTime || newAvailabilityFromDate;

    setNewAvailabilityFrom(currentTime);
    setNewAvailabilityObject({
      from: currentTime,
      id: 0,
      to: newAvailabilityObject.to === null ? null : newAvailabilityObject.to,
    });
    if (
      newAvailabilityObject.from != null &&
      newAvailabilityObject.to != null
    ) {
      setEnableNewAvailabilitySave(true);
    }
  };
  const onNewToAvailabilityChange = (event, selectedTime) => {
    const currentTime = selectedTime || newAvailabilityToDate;

    setNewAvailabilityTo(currentTime);
    console.log(currentTime);
    const obj = {
      from:
        newAvailabilityObject.from === null ? null : newAvailabilityObject.from,
      id: 0,
      to: currentTime,
    };
    setNewAvailabilityObject(obj);
    if (
      newAvailabilityObject.from != null &&
      newAvailabilityObject.to != null
    ) {
      setEnableNewAvailabilitySave(true);
    }
    console.log(obj);
  };

  const onNewAvailabilitySave = () => {
    const obj = {
      from: newAvailabilityObject.from,
      id: 0,
      to: newAvailabilityObject.to,
    };
    // setNewAvailabilityObject(obj);

    if (
      newAvailabilityObject?.from?.getHours() >
      newAvailabilityObject?.to?.getHours()
    ) {
      alert("From must be less than To");
    } else {
      setEditedTime([...editedTime, newAvailabilityObject]);
      createAvailiability.mutate(
        {
          from: convertTimeBackToSeconds(
            newAvailabilityObject?.from?.getHours(),
            newAvailabilityObject?.from?.getMinutes(),
          ),
          to: convertTimeBackToSeconds(
            newAvailabilityObject?.to?.getHours(),
            newAvailabilityObject?.to?.getMinutes(),
          ),
          sellerId: sellerId,
          day: format(selectedDay, "EEEE").toUpperCase() as Day,
        },
        {
          onSuccess: (data) => {
            console.log("omo");
          },
        },
      );
      setIsCreateButtonEnabled(false);
      console.log("ojomojos");
      console.log(newAvailabilityObject);
    }
  };
  const onDeleteClick = (id) => {
    console.log(id);
    const newAvailability = [...editedTime];

    deleteSellerAvailability.mutate(
      {
        availabilityId: id,
      },
      {
        onSuccess: () => {
          newAvailability.splice(
            newAvailability
              .map((availabilities) => availabilities.id)
              .indexOf(id),
            1,
          );
          setEditedTime(newAvailability);
        },
        onError: (data) => {
          alert(" Cannot Delete with Active Appointments");
        },
      },
    );
  };
  const sendBackToDatabase = async (id, from, to) => {
    editSellerAvailability.mutateAsync({
      availiabilityId: id,
      from: convertTimeBackToSeconds(from.getHours(), from.getMinutes()),
      to: convertTimeBackToSeconds(to.getHours(), to.getMinutes()),
      day: format(selectedDay, "EEEE").toUpperCase() as Day,
    });
    trpc.useContext().appointment.getSellerAvailabilty.invalidate();
  };
  return (
    <>
      <View className="flex ">
        {isCreateButtonEnabled && (
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <DateTimePicker
                style={{ marginVertical: 8, right: 20 }}
                testID="timePicker"
                value={newAvailabilityFromDate}
                mode="time"
                is24Hour={true}
                minuteInterval={30}
                onChange={onNewFromAvailabilityChange}
              />
              <DateTimePicker
                testID="timePicker"
                style={{ marginVertical: 8, right: 20 }}
                value={newAvailabilityToDate}
                mode="time"
                is24Hour={true}
                minuteInterval={30}
                onChange={onNewToAvailabilityChange}
              />
              <Pressable
                disabled={!enableNewAvailabilitySave}
                onPress={() => {
                  onNewAvailabilitySave();
                  console.log(format(selectedDay, "EEEE").toUpperCase());
                }}
              >
                <AntDesign name="save" size={24} color="black" />
              </Pressable>
              <Button
                title="Save"
                disabled={!enableNewAvailabilitySave}
                onPress={() => {
                  onNewAvailabilitySave();
                  console.log(format(selectedDay, "EEEE").toUpperCase());
                }} // Replace "New Name" with the desired new name
              />
            </View>
          </View>
        )}

        {editedTime.map((item) => (
          <View key={item.id}>
            <View
              key={item.id}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <DateTimePicker
                style={{ marginVertical: 8, right: 20 }}
                testID="timePicker"
                value={item.from}
                mode="time"
                is24Hour={true}
                onChange={(event, selected) =>
                  onChange(event, selected, editedTime, item.id)
                }
              />
              <DateTimePicker
                testID="timePicker"
                style={{ marginVertical: 8, right: 20 }}
                value={item.to}
                mode="time"
                is24Hour={true}
                onChange={(event, selected) =>
                  onChangeTo(event, selected, editedTime, item.id)
                }
              />
              {selectedItemId === item.id && showSaveButton && (
                <>
                  <Pressable
                    style={{ marginRight: 10 }}
                    onPress={() => {
                      console.log(format(selectedDay, "EEEE").toUpperCase());
                      editedTime.map((itemize) =>
                        itemize.id === item.id
                          ? sendBackToDatabase(
                              itemize.id,
                              itemize.from,
                              itemize.to,
                            )
                          : "No",
                      );
                      // editFromById(editedTime, item.id, new Date());
                    }}
                  >
                    <AntDesign name="save" size={19} color="black" />
                  </Pressable>
                  {/* <Button
                    title={"Save"}
                    onPress={() => {
                      console.log(format(selectedDay, "EEEE").toUpperCase());
                      editedTime.map((itemize) =>
                        itemize.id === item.id
                          ? sendBackToDatabase(
                              itemize.id,
                              itemize.from,
                              itemize.to,
                            )
                          : "No",
                      );
                      // editFromById(editedTime, item.id, new Date());
                    }} // Replace "New Name" with the desired new name
                  /> */}
                </>
              )}

              <Pressable
                onPress={() => {
                  onDeleteClick(item.id);
                }}
                key={item.id}
              >
                <AntDesign name="delete" size={19} color="black" />
              </Pressable>

              {/* <Text>{format(item.from, "hh:mm")}</Text> */}

              {/* {format(item.from, "hh:mm")} {format(item.to, "hh:mm")} */}
            </View>

            {/* <DateTimePickerModal
              textColor="black"
              isVisible={isDatePickerVisible}
              mode="time"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            /> */}

            <></>
          </View>
        ))}
      </View>
      {/* <Text>{getSellerAvailabilty.from}</Text>
      <Text>{getSellerAvailabilty.to}</Text> */}
    </>
  );
};

export default ShowAvailabilityList;
