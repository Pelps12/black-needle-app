import * as Updates from "expo-updates";

let Config = {
  CLERK_PUBLISHABLE_KEY:
    "pk_test_ZW5vcm1vdXMtc2F3ZmlzaC05MS5jbGVyay5hY2NvdW50cy5kZXYk",
  PUBLIC_URL: "https://dev.sakpa.co",
  ALGOLIA_INDEX: "dev_sakpa",
  NEXT_PUBLIC_UPLOADCARE_PUB_KEY: "ee6b07357ef85077ad3e",
  STRIPE_PUBLISHABLE_KEY:
    "pk_test_51M482WChaXTQFF1r63Ekbj7Gl8pcRDNLhGNLrLdshWxGOWyDtsmucwUgVUcOYcNm6e9GAcrOI4M8kDwb4qdovjcb006Gu3lgyh",
  MERCHANT_ID: "merchant.co.sakpa",
};

if (Updates.channel === "production") {
  Config.CLERK_PUBLISHABLE_KEY = "pk_live_Y2xlcmsuc2FrcGEuY28k";
  Config.PUBLIC_URL = "https://www.sakpa.co";
  Config.ALGOLIA_INDEX = "sakpa";
  Config.STRIPE_PUBLISHABLE_KEY =
    "pk_live_51M482WChaXTQFF1rkBgJlD0NzpuCx3M1AZnUcWF47i037nUIwEe9kVbnrCVru1P0PFJW1K70ELSrtBQ0TXNWtw7000kEXLQlHF";
}

export default Config;
