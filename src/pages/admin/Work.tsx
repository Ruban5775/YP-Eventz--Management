//admin work.tsx

import { useEffect, useState } from "react";
import { FiEdit2, FiEye, FiImage, FiPlus, FiTrash2, FiUploadCloud, FiVideo } from "react-icons/fi";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Btn, Card, Field, Modal, PageActions, StatusPill, Table, inputCls } from "@/components/admin/ui";
import { loadEventServices } from "@/data/site";
import {
    uploadCover,
    uploadImages,
    uploadVideos,
    type CloudinaryUploadResult
} from "@/utils/cloudinary";



const API_BASE = import.meta.env.VITE_API_BASE;

type Row = {
    id: number;
    title: string;
    category: string;
    event_date: string;
    cover: string;

    images: {
        type: string;
        url: string;
    }[];

    videos: {
        type: string;
        url: string;
    }[];

    status: "Active" | "Inactive";
};

interface EventMediaPayload {

    event_id: number;

    isEdit: boolean;

    cover: CloudinaryUploadResult | null;

    images: CloudinaryUploadResult[];

    videos: CloudinaryUploadResult[];

}


/*speed optimization*/
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1920;
const IMAGE_QUALITY = 0.82;



/*
|--------------------------------------------------------------------------
| Upload Media With Progress
|--------------------------------------------------------------------------
*/

// function uploadMedia(
//     formData: FormData,
//     onProgress: (progress: number) => void
// ): Promise<any> {
//     return new Promise((resolve, reject) => {
//         const xhr = new XMLHttpRequest();

//         xhr.open(
//             "POST",
//             `${API_BASE}/admin/upload_event_media.php`
//         );

//         xhr.upload.onprogress = (event) => {
//             if (!event.lengthComputable) {
//                 return;
//             }

//             const progress = Math.round(
//                 (event.loaded / event.total) * 100
//             );

//             onProgress(progress);
//         };

//         xhr.onload = () => {


//             console.log("RAW RESPONSE:");
//             console.log(xhr.responseText);
//             try {
//                 const result = JSON.parse(
//                     xhr.responseText
//                 );
                

//                 if (
//                     xhr.status >= 200 &&
//                     xhr.status < 300
//                 ) {
//                     resolve(result);
//                 } else {
//                     reject(
//                         new Error(
//                             result.message ||
//                             "Media upload failed."
//                         )
//                     );
//                 }
//             } catch {
//                 reject(
//                     new Error(
//                         "Invalid response from upload server."
//                     )
//                 );
//             }
//         };

//         xhr.onerror = () => {
//             reject(
//                 new Error(
//                     "Network error while uploading media."
//                 )
//             );
//         };

//         xhr.send(formData);
//     });
// }
// //end




export default function Work() {
    const [rows, setRows] = useState<Row[]>([]);
    const [open, setOpen] = useState(false);
    const [preview, setPreview] = useState<Row | null>(null);
    const [edit, setEdit] = useState<Row | null>(null);
    const [cover, setCover] = useState<File | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [videos, setVideos] = useState<File[]>([]);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState("");
    const [categories, setCategories] = useState<string[]>([]);

    const [existingCover, setExistingCover] = useState("");

    const [existingImages, setExistingImages] = useState<
        {
            type: string;
            url: string;
        }[]
    >([]);

    const [existingVideos, setExistingVideos] = useState<
        {
            type: string;
            url: string;
        }[]
    >([]);

    useEffect(() => {
        loadEvents();
        loadCategories();
    }, []);


    const loadEvents = async () => {

        try {

            const response = await fetch(
                `${API_BASE}/admin/get_events.php`
            );

            const result = await response.json();

            if (result.success) {

                setRows(result.data);

            } else {

                toast.error(result.message);

            }

        } catch (err) {

            toast.error("Unable to load events.");

        }

    };

    const loadCategories = async () => {

        try {

            const services = await loadEventServices();

            setCategories(
                services.map(service => service.title)
            );

        } catch (error) {


            toast.error("Unable to load categories.");

        }

    };



    const openNew = () => {

        setEdit({
            id: 0,
            title: "",
            category: categories[0] ?? "",
            event_date: "",
            cover: "",
            images: [],
            videos: [],
            status: "Active",
        });

        // Clear new uploads
        setCover(null);
        setImages([]);
        setVideos([]);

        // Clear previous edit previews
        setExistingCover("");
        setExistingImages([]);
        setExistingVideos([]);

        setOpen(true);
    };

    const closeModal = () => {
        setOpen(false);

        setEdit(null);

        setCover(null);
        setImages([]);
        setVideos([]);

        setExistingCover("");
        setExistingImages([]);
        setExistingVideos([]);
    };


    const openEdit = (r: Row) => {

        setEdit({ ...r });

        setExistingCover(r.cover);

        setExistingImages(r.images);

        setExistingVideos(r.videos);

        setCover(null);

        setImages([]);

        setVideos([]);

        setOpen(true);

    };


  const remove = async (id: number) => {

    if (!confirm("Delete this event?")) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/admin/delete_event.php`,
            {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
    }
);

const responseText = await response.text();


if (!response.ok) {
    throw new Error(responseText);
}

const result = JSON.parse(responseText);

        if (!result.success) {

            toast.error(result.message);

            return;

        }

        toast.success(result.message);

        await loadEvents();

    } 
    // catch (err) {


    //     toast.error("Unable to delete event.");

    // }

    catch (err: any) {
    console.error(err);
    toast.error(err.message);
}

};

const save = async () => {

    if (!edit || saving) return;

    const isEdit = edit.id !== 0;

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (edit.title.trim() === "") {
        toast.error("Please enter event title.");
        return;
    }

    if (!edit.category) {
        toast.error("Please select a category.");
        return;
    }

    if (!edit.event_date) {
        toast.error("Please select event date.");
        return;
    }

    if (!isEdit && !cover) {
        toast.error("Please select a cover image.");
        return;
    }

    if (!isEdit && images.length === 0) {
        toast.error("Please select at least one gallery image.");
        return;
    }

    try {

        setSaving(true);
        setUploadProgress(0);
        setUploadStatus("Saving event details...");

        /*
        |--------------------------------------------------------------------------
        | Save Event
        |--------------------------------------------------------------------------
        */

        const api = isEdit
            ? `${API_BASE}/admin/update_event.php`
            : `${API_BASE}/admin/add_event.php`;

        const response = await fetch(api, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(edit)

        });
           if (!response.ok) {

                const errorText = await response.text();

                throw new Error(

                    errorText || "Unable to save event."

                );

            }

        const result = await response.json();

        if (!result.success) {

            throw new Error(
                result.message || "Unable to save event."
            );

        }

        const eventId = Number(
                isEdit
                ? edit.id
                : result.event_id
        );

        /*
        |--------------------------------------------------------------------------
        | Upload To Cloudinary
        |--------------------------------------------------------------------------
        */

const mediaPayload: EventMediaPayload = {

    event_id: eventId,

    isEdit,

    cover: null,

    images: [],

    videos: []

};

        /*
        |--------------------------------------------------------------------------
        | Cover
        |--------------------------------------------------------------------------
        */

        if (cover) {

            setUploadStatus("Uploading cover...");

            mediaPayload.cover =
                await uploadCover(

                    cover,

                    eventId,

                    progress => {

                        setUploadProgress(progress);

                    }

                );

        }

        /*
        |--------------------------------------------------------------------------
        | Images
        |--------------------------------------------------------------------------
        */

        if (images.length > 0) {

            setUploadStatus("Uploading gallery images...");

            mediaPayload.images =
                await uploadImages(

                    images,

                    eventId,

                    progress => {

                        setUploadProgress(progress);

                    }

                );

        }

        /*
        |--------------------------------------------------------------------------
        | Videos
        |--------------------------------------------------------------------------
        */

        if (videos.length > 0) {

            setUploadStatus("Uploading videos...");

            mediaPayload.videos =
                await uploadVideos(

                    videos,

                    eventId,

                    progress => {

                        setUploadProgress(progress);

                    }

                );

        }

        /*
        |--------------------------------------------------------------------------
        | Save Media URLs
        |--------------------------------------------------------------------------
        */

        const hasMedia =

            !!mediaPayload.cover ||

            mediaPayload.images.length > 0 ||

            mediaPayload.videos.length > 0;

        if (hasMedia) {

            setUploadStatus("Saving media details...");

            const mediaResponse = await fetch(
                `${API_BASE}/admin/save_event_media.php`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(mediaPayload)
                }
            );

          if (!mediaResponse.ok) {

                    const errorText = await mediaResponse.text();

                    throw new Error(

                        errorText || "Unable to save media."

                    );

                }

            const mediaResult = await mediaResponse.json();

            if (!mediaResult.success) {

                throw new Error(
                    mediaResult.message ||
                    "Unable to save media."
                );

            }

        }

        /*
        |--------------------------------------------------------------------------
        | Success
        |--------------------------------------------------------------------------
        */

        setUploadProgress(100);

        setUploadStatus("Event saved successfully.");

        toast.success(

            isEdit

                ? "Event updated successfully."

                : "Event created successfully."

        );

        setEdit(null);

        setCover(null);

        setImages([]);

        setVideos([]);

        setExistingCover("");

        setExistingImages([]);

        setExistingVideos([]);

        setOpen(false);

        await loadEvents();

    }

    catch (error) {


        toast.error(

            error instanceof Error

                ? error.message

                : "Unable to save event."

        );

    }

    finally {

        setSaving(false);

        setUploadProgress(0);

        setUploadStatus("");

    }

};

    return (
        <AdminLayout title="Our Work">
            <PageActions>
                <div className="text-sm text-muted-foreground">{rows.length} events</div>
                <Btn onClick={openNew}><FiPlus /> Add Event</Btn>
            </PageActions>

            <Table
                headers={[
                    "Cover",
                    "Title",
                    "Category",
                    "Event Date",
                    "Media",
                    "Status",
                    "Actions",
                ]}
            >
                {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-surface">
                        <td className="px-4 py-3"><img src={r.cover} alt="" className="h-12 w-16 rounded-lg object-cover" /></td>
                        <td className="px-4 py-3 font-semibold text-ink">{r.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.category}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                            {new Date(r.event_date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><FiImage /> {r.images.length}</span>
                            <span className="ml-3 inline-flex items-center gap-1"><FiVideo /> {r.videos.length}</span>
                        </td>
                        <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                        <td className="px-4 py-3">
                            <div className="flex gap-2">
                                <button onClick={() => setPreview(r)} className="rounded-full border border-border p-2 text-ink hover:border-brand hover:text-brand"><FiEye /></button>
                                <button onClick={() => openEdit(r)} className="rounded-full border border-border p-2 text-ink hover:border-brand hover:text-brand"><FiEdit2 /></button>
                                <button onClick={() => remove(r.id)} className="rounded-full border border-border p-2 text-ink hover:border-brand hover:text-brand"><FiTrash2 /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            <Modal
                open={!!preview}
                onClose={() => setPreview(null)}
                title={preview?.title || ""}
            >
                {preview && (
                    <div>

                        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-brand">
                            {preview.category}
                        </div>

                        {/* Images */}

                        {preview.images.length > 0 && (
                            <>
                                <h4 className="mb-3 text-sm font-semibold">
                                    Images
                                </h4>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {preview.images.map((image, i) => (
                                        <img
                                            key={i}
                                            src={image.url}
                                            alt=""
                                            className="aspect-square w-full rounded-xl object-cover"
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Videos */}

                        {preview.videos.length > 0 && (
                            <>
                                <h4 className="mt-6 mb-3 text-sm font-semibold">
                                    Videos
                                </h4>

                                <div className="space-y-4">
                                    {preview.videos.map((video, i) => (
                                        <video
                                            key={i}
                                            controls
                                            className="w-full rounded-xl border"
                                        >
                                            <source
                                                src={video.url}
                                                type="video/mp4"
                                            />
                                        </video>
                                    ))}
                                </div>
                            </>
                        )}

                    </div>
                )}
            </Modal>

            <Modal open={open} onClose={closeModal} title={edit && rows.some((x) => x.id === edit.id) ? "Edit Event" : "Add Event"}
                footer={
                    <>
                        <Btn
                            variant="ghost"
                            onClick={closeModal}
                            disabled={saving}
                        >
                            Cancel
                        </Btn>

                        <Btn
                            onClick={save}
                            disabled={saving}
                        >
                            {saving
                                ? uploadProgress > 0
                                    ? `Uploading ${uploadProgress}%`
                                    : "Processing..."
                                : "Save"
                            }
                        </Btn>
                    </>
                }>
                {edit && (
                    <div className="space-y-4">
                        {saving && (
                            <div className="rounded-xl border border-border bg-surface p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm font-semibold text-ink">
                                        {uploadStatus}
                                    </span>

                                    {uploadProgress > 0 && (
                                        <span className="text-sm font-bold text-brand">
                                            {uploadProgress}%
                                        </span>
                                    )}
                                </div>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
                                    <div
                                        className="h-full rounded-full bg-brand transition-all duration-300"
                                        style={{
                                            width:
                                                uploadProgress > 0
                                                    ? `${uploadProgress}%`
                                                    : "5%",
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Event Title"><input className={inputCls} value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></Field>
                            <Field label="Category">
                                <select className={inputCls} value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>
                                    {categories.map((category) => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <Field label="Event Date">
                            <input
                                type="date"
                                className={inputCls}
                                value={edit.event_date}
                                onChange={(e) =>
                                    setEdit({
                                        ...edit,
                                        event_date: e.target.value
                                    })
                                }
                            />
                        </Field>
                        <UploadZone
                            label="Cover Image"
                            hint="Multiple JPG, JPEG, PNG or WEBP · Max 10MB each"
                            accept=".jpg,.jpeg,.png,.webp"
                            onSelect={(files) => {
                                if (files.length) {
                                    setCover(files[0]);
                                }
                            }}
                        />

                        {cover ? (

                            <img
                                src={URL.createObjectURL(cover)}
                                className="mt-3 h-40 w-full rounded-xl border object-cover"
                            />

                        ) : existingCover ? (

                            <img
                                src={existingCover}
                                className="mt-3 h-40 w-full rounded-xl border object-cover"
                            />

                        ) : null}

                        <UploadZone
                            label="Gallery Images"
                            hint="Multiple JPG, JPEG, PNG  · Max 10MB each"
                            multiple
                            accept=".jpg,.jpeg,.png"
                            onSelect={(files) => {
                                setImages(Array.from(files));
                            }}
                        />

                        {existingImages.length > 0 && (

                            <div className="mt-4">

                                <h4 className="mb-2 text-sm font-semibold">
                                    Current Gallery
                                </h4>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                                    {existingImages.map((img, index) => (

                                        <div
                                            key={index}
                                            className="relative"
                                        >

                                            <img
                                                src={img.url}
                                                className="h-24 w-full rounded-lg border object-cover"
                                            />

                                        </div>

                                    ))}

                                </div>

                            </div>

                        )}


                        {images.length > 0 && (

                            <div className="mt-4">

                                <h4 className="mb-2 text-sm font-semibold">
                                    New Images
                                </h4>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                                    {images.map((img, index) => (

                                        <img
                                            key={index}
                                            src={URL.createObjectURL(img)}
                                            className="h-24 w-full rounded-lg border object-cover"
                                        />

                                    ))}

                                </div>

                            </div>

                        )}

                        <UploadZone
                            label="Videos"
                            hint="MP4 · Max 50MB each"
                            icon={<FiVideo className="h-6 w-6" />}
                            multiple
                            accept=".mp4"
                            onSelect={(files) => {
                                setVideos(Array.from(files));
                            }}
                        />

                        {existingVideos.length > 0 && (

                            <div className="mt-4">

                                <h4 className="mb-2 text-sm font-semibold">
                                    Current Videos
                                </h4>

                                <div className="space-y-3">

                                    {existingVideos.map((video, index) => (

                                        <video
                                            key={index}
                                            controls
                                            className="h-48 w-full rounded-xl border"
                                        >
                                            <source src={video.url} />
                                        </video>

                                    ))}

                                </div>

                            </div>

                        )}

                        {videos.length > 0 && (

                            <div className="mt-4">

                                <h4 className="mb-2 text-sm font-semibold">
                                    New Videos
                                </h4>

                                <div className="space-y-3">

                                    {videos.map((video, index) => (

                                        <video
                                            key={index}
                                            controls
                                            className="h-48 w-full rounded-xl border"
                                        >
                                            <source
                                                src={URL.createObjectURL(video)}
                                                type={video.type}
                                            />
                                        </video>

                                    ))}

                                </div>

                            </div>

                        )}
                        <Field label="Status">
                            <select className={inputCls} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as Row["status"] })}>
                                <option>Active</option><option>Inactive</option>
                            </select>
                        </Field>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}

function UploadZone({
    label,
    hint,
    icon,
    multiple,
    accept,
    onSelect,
}: {
    label: string;
    hint: string;
    icon?: React.ReactNode;
    multiple?: boolean;
    accept?: string;
    onSelect: (files: FileList) => void;
}) {

    return (

        <Card className="border-2 border-dashed">

            <div className="text-xs font-semibold uppercase tracking-wider text-ink">
                {label}
            </div>

            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl bg-surface py-8 hover:bg-brand/5">

                <span className="text-brand">
                    {icon || <FiUploadCloud className="h-7 w-7" />}
                </span>

                <span className="text-sm font-semibold">
                    Click to upload
                </span>

                <span className="text-xs text-muted-foreground">
                    {hint}
                </span>

                <input

                    type="file"
                    multiple={multiple}
                    accept={accept}
                    className="hidden"

                    onChange={(e) => {
                        if (!e.target.files || e.target.files.length === 0) return;

                        const files = Array.from(e.target.files);

                        /*
                        |--------------------------------------------------------------------------
                        | VIDEO VALIDATION - MAX 50MB
                        |--------------------------------------------------------------------------
                        */

                        if (accept === ".mp4") {
                            const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB;

                            const validVideos = files.filter((file) => {
                                if (file.size > MAX_VIDEO_SIZE) {
                                    toast.error(
                                        `${file.name} exceeds 50MB. Please upload a compressed video.`
                                    );
                                    return false;
                                }

                                return true;
                            });

                            if (validVideos.length > 0) {
                                const dt = new DataTransfer();

                                validVideos.forEach((file) => {
                                    dt.items.add(file);
                                });

                                onSelect(dt.files);

                                toast.success(
                                    `${validVideos.length} video(s) selected`
                                );
                            }

                            // Reset input so same file can be selected again
                            e.target.value = "";

                            return;
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | IMAGE VALIDATION - MAX 10MB
                        |--------------------------------------------------------------------------
                        */

                        const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

                        const validImages = files.filter((file) => {
                            if (file.size > MAX_IMAGE_SIZE) {
                                toast.error(
                                    `${file.name} exceeds 10MB. Please upload an image smaller than 10MB.`
                                );

                                return false;
                            }

                            return true;
                        });

                        if (validImages.length > 0) {
                            const dt = new DataTransfer();

                            validImages.forEach((file) => {
                                dt.items.add(file);
                            });

                            onSelect(dt.files);

                            toast.success(
                                `${validImages.length} image(s) selected`
                            );
                        }

                        // Reset input so same file can be selected again
                        e.target.value = "";
                    }}

                />

            </label>

        </Card>

    );

}