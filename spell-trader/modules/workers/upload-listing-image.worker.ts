import storage from "@/modules/firebase/storage";
import api from "@/modules/frontend/api";
import type FileContainer from "@/types/FileContainer";
import debug from "../debug";
import { UploadError } from "../frontend/google/cloud/storage/errors/upload-error";
import { EventData } from "../frontend/upload/files";

export type Event = MessageEvent<{ fileContainer: FileContainer }>;

onmessage = function (event: Event) {
  const { fileContainer } = event.data;
  const { file, id } = fileContainer;

  storage
    .uploadFile(file, "images")
    .then(({ url, path }) => {
      // Send the response back to the main script
      postMessage({ result: { url, id, path } } as EventData);
    })
    .catch((error: UploadError) => {
      // Send the error back to the main script
      postMessage({ error: error.message } as EventData);
    })
    .finally(() => self.close());
};

onerror = (event) => {
  debug(event);
  api.log("frontend:worker Unexpected error: " + JSON.stringify(event));
  throw event;
};
