const API_BASE = import.meta.env.VITE_API_BASE;

export interface CloudinaryUploadResult {
     media_url: string;

    public_id: string;

    resource_type: "image" | "video";
}

interface SignatureResponse {
    success: boolean;
    cloud_name: string;
    api_key: string;
    timestamp: number;
    signature: string;
    folder: string;
    message?: string;
}

async function getSignature(folder: string): Promise<SignatureResponse> {

    const res = await fetch(
        `${API_BASE}/admin/cloudinary_signature.php`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                folder
            })
        }
    );

   const data = await res.json();

    if (!data.success) {

        throw new Error(
            data.message || "Unable to get Cloudinary signature."
        );

    }

    return data;

}

async function uploadFile(
    file: File,
    folder: string,
    resourceType: "image" | "video",
    onProgress?: (progress: number) => void
 ): Promise<CloudinaryUploadResult> {

    const sign = await getSignature(folder);

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
        "api_key",
        sign.api_key
    );

    formData.append(
        "timestamp",
        String(sign.timestamp)
    );

    formData.append(
        "signature",
        sign.signature
    );

    formData.append(
        "folder",
        sign.folder
    );

    return new Promise((resolve, reject) => {

        const xhr = new XMLHttpRequest();

        xhr.timeout = 300000; // 5 minutes
        xhr.upload.onprogress = (e) => {

            if (
                e.lengthComputable &&
                onProgress
            ) {

                onProgress(
                    Math.round(
                        (e.loaded / e.total) * 100
                    )
                );

            }

        };

        xhr.onload = () => {

            if (
                xhr.status >= 200 &&
                xhr.status < 300
            ) {

                try {

                    const response = JSON.parse(
                        xhr.responseText
                    );

                    resolve({

                        media_url:
                            response.secure_url,

                        public_id:
                            response.public_id,

                     resource_type: response.resource_type

                    });

                } catch {

                    reject(
                        new Error(
                            "Invalid Cloudinary response."
                        )
                    );

                }

            } else {

                reject(
                    new Error(
                        xhr.responseText
                    )
                );

            }

        };

        xhr.onerror = () => {

            reject(
                new Error(
                    "Cloudinary upload failed."
                )
            );

        };

        xhr.ontimeout = () => {

                reject(
                    new Error("Cloudinary upload timed out.")
                );

            };


        xhr.open(

            "POST",

            `https://api.cloudinary.com/v1_1/${sign.cloud_name}/${resourceType}/upload`

         );

        xhr.send(formData);

       

    });

}

/*
|--------------------------------------------------------------------------
| Upload Cover
|--------------------------------------------------------------------------
*/

export async function uploadCover(

    file: File,

    eventId: number,

    onProgress?: (progress: number) => void

) {

    return uploadFile(

        file,

        `ypeventz/event_${eventId}`,

        "image",

        onProgress

    );

}

/*
|--------------------------------------------------------------------------
| Upload Images
|--------------------------------------------------------------------------
*/

export async function uploadImages(

    files: File[],

    eventId: number,

    onProgress?: (progress: number) => void

): Promise<CloudinaryUploadResult[]> {

    return Promise.all(

        files.map(

            file =>

                uploadFile(

                    file,

                    `ypeventz/event_${eventId}`,

                    "image",

                    onProgress

                )

        )

    );

}

/*
|--------------------------------------------------------------------------
| Upload Videos
|--------------------------------------------------------------------------
*/

export async function uploadVideos(

    files: File[],

    eventId: number,

    onProgress?: (progress: number) => void

): Promise<CloudinaryUploadResult[]> {

    return Promise.all(

        files.map(

            file =>

                uploadFile(

                    file,

                    `ypeventz/event_${eventId}`,

                    "video",

                    onProgress

                )

        )

    );

}