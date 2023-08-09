import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@acme/api";
import { AppointmentHistory, OrderStatus } from "@acme/db";

import { ArrayElement } from "./types";

type RouterOutput = inferRouterOutputs<AppRouter>;
type AppointmentType = RouterOutput["appointment"]["getAppointments"];
const statusHelper = (
  appointment: ArrayElement<AppointmentType>,
  sellerMode: boolean,
): string[] => {
  const dpEnabled = !!appointment.price.category.seller.downPaymentPercentage;
  if (appointment.status === "PENDING") {
    if (sellerMode) {
      return ["APPROVE", "DECLINE"];
    } else {
      if (appointment.history.find((prev) => prev.status === "PAID")) {
        return ["RESCHEDULE", "CANCEL"];
      } else {
        return [];
      }
    }
  } else if (appointment.status === "APPROVED") {
    if (sellerMode) {
      return ["CANCEL"];
    } else {
      if (dpEnabled) {
        return ["RESCHEDULE", "DOWNPAY"];
      } else {
        return ["RESCHEDULE", "PAY"];
      }
    }
  } else if (appointment.status === "DECLINED") {
    if (sellerMode) {
      return [];
    } else {
      return ["RESCHEDULE"];
    }
  } else if (appointment.status === "PAID") {
    if (sellerMode) {
      if (
        appointment.appointmentDate &&
        appointment.appointmentDate <= new Date()
      ) {
        return ["CANCEL", "COMPLETE"];
      }
      return ["CANCEL"];
    } else {
      return ["RESCHEDULE", "CANCEL"];
    }
  } else if (appointment.status === "DOWNPAID") {
    if (sellerMode) {
      return ["CANCEL"];
    } else {
      return ["RESCHEDULE", "CANCEL", "PAY"];
    }
  } else {
    return [];
  }
};

export default statusHelper;
