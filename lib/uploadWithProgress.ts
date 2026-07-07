"use client";

export interface UploadWithProgressResult<T> {
  ok: boolean;
  status: number;
  data: T;
}

/**
 * Uploads a FormData payload via XMLHttpRequest instead of fetch so we get
 * real upload progress events — fetch has no cross-browser-reliable way to
 * report upload (as opposed to download) progress. Shared by every
 * file-upload UI instead of each one rolling its own XHR boilerplate.
 */
export function uploadWithProgress<T = unknown>(
  url: string,
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<UploadWithProgressResult<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: T;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = {} as T;
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}
