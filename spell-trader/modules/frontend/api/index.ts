import notifications from "./notifications";
import upload from "./upload";
import log from "./log";
import users from "./users";
import google from "./google";
import weaviate from "./weaviate";
import stripe from "./stripe";

const api = {
  notifications,
  upload,
  log,
  users,
  google,
  weaviate,
  stripe,
};

export default api;
