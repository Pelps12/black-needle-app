import Twilio from "twilio";

import { env } from "@acme/env-config/env";

declare global {
  // eslint-disable-next-line no-var
  var twilio: Twilio.Twilio | undefined;
}

export const twilio = global.twilio || Twilio(env.TWILIO_SID, env.AUTH_TOKEN);
if (env.NODE_ENV !== "production") {
  global.twilio = twilio;
}
