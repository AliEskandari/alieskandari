import FileContainer from "@/types/FileContainer";
import debug from "./debug";

export type EventData = {
  result: { url: string; id: number; path: string };
  error?: string;
};

export const files = (
  fileContainers: FileContainer[],
  onSuccess: (result: EventData["result"]) => void,
  onError?: (error: any) => void
) => {
  debug("Uploading files...", fileContainers);

  fileContainers.forEach((fileContainer) => {
    const worker = new Worker(
      new URL("../../workers/upload-listing-image.worker.ts", import.meta.url)
    );

    // Listen for messages from the worker
    worker.onmessage = function (event: MessageEvent<EventData>) {
      const { result, error }: EventData = event.data;
      if (result) {
        onSuccess(result);
      } else if (error) {
        onError?.(error);
      }
    };

    // run worker
    worker.postMessage({ fileContainer });
  });
};
