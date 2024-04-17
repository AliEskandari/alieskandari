import FileContainer from "@/types/FileContainer";
import { captureMessage } from "@sentry/nextjs";
import log from "../log";

/**
 * Sends one file to backend to upload to google cloud. Returns
 * json with file url and id of file.
 */
const photos = async (fileContainer: FileContainer) => {
  try {
    const formData = new FormData();
    formData.append("file", fileContainer.file);
    formData.append("id", fileContainer.id.toString());
    log("6. frontend:api:upload Sending photo..." + JSON.stringify(formData));

    const resp = await fetch("/api/send-photo-to-gcs", {
      method: "POST",
      body: formData,
    });
    log("7. frontend:api:upload Response..." + JSON.stringify(resp));

    const data = await resp.json();
    return data;
  } catch (error) {
    log("8. frontend:api:upload Error..." + JSON.stringify(error));
    return error;
  }
};

const upload = { photos };
export default upload;
