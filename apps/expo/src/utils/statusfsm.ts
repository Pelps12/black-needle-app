import { AppointmentHistory, OrderStatus } from "@acme/db";

const statusHelper = (
  status: OrderStatus,
  history: AppointmentHistory[],
  sellerMode: boolean,
  dpEnabled: boolean,
): string[] => {
  if (status === "PENDING") {
    if (sellerMode) {
      return ["APPROVE", "DECLINE"];
    } else {
      if (history.find((prev) => prev.status === "PAID")) {
        return ["RESCHEDULE", "CANCEL"];
      } else {
        return [];
      }
    }
  } else if (status === "APPROVED") {
    if (sellerMode) {
      return ["CANCEL"];
    } else {
      if (dpEnabled) {
        return ["RESCHEDULE", "DOWNPAY"];
      } else {
        return ["RESCHEDULE", "PAY"];
      }
    }
  } else if (status === "DECLINED") {
    if (sellerMode) {
      return [];
    } else {
      return ["RESCHEDULE"];
    }
  } else if (status === "PAID") {
    if (sellerMode) {
      return ["CANCEL"];
    } else {
      return ["RESCHEDULE", "CANCEL"];
    }
  } else if (status === "DOWNPAID") {
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
