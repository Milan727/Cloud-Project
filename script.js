// ==========================================
// ⚙️ AWS CONFIGURATION
// ==========================================
import { AWS_CONFIG } from './aws-config.js';

const REGION = AWS_CONFIG.REGION;
const BUCKET_NAME = AWS_CONFIG.BUCKET_NAME;
const ACCESS_KEY = AWS_CONFIG.ACCESS_KEY;
const SECRET_KEY = AWS_CONFIG.SECRET_KEY;

// ==========================================
// 🚀 SETUP AWS
// ==========================================
AWS.config.update({
    region: REGION,
    credentials: new AWS.Credentials(ACCESS_KEY, SECRET_KEY)
});

const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: BUCKET_NAME }
});

// Import Firebase Auth & Firestore Logic
import { auth } from './firebase-config.js';
import { addFileToFirestore, getUserFiles, deleteFileFromFirestore, updateFileName } from './firestore-db.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// ==========================================
// 🖥️ UI LOGIC
// ==========================================
const fileInput = document.getElementById('fileInput');
const fileListBody = document.getElementById('fileListBody');

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        console.log("User logged in:", currentUser.uid);
        loadUserFiles(currentUser.uid);
    } else {
        currentUser = null;
        fileListBody.innerHTML = `<tr><td colspan="4" class="empty-state">Please login to view files.</td></tr>`;
    }
});

window.triggerFileUpload = function () {
    fileInput.click();
}

fileInput.addEventListener('click', function (e) {
    e.stopPropagation(); // Prevents the click from bubbling up to the drop-zone again
});

fileInput.addEventListener('change', function () {
    if (this.files.length > 0) {
        if (!currentUser) {
            alert("You must be logged in to upload files.");
            return;
        }
        uploadToAWS(this.files[0]);
    }
});

// ==========================================
// ☁️ AWS FUNCTIONS (USER ISOLATED)
// ==========================================

function uploadToAWS(file) {
    const fileId = Date.now(); // Temporary ID for UI

    // Create a temporary row
    renderFileRow({
        id: fileId,
        name: file.name,
        size: file.size,
        createdAt: { seconds: Date.now() / 1000 }
    }, true);

    const s3Key = `users/${currentUser.uid}/${file.name}`;

    const params = {
        Key: s3Key,
        Body: file,
        ContentType: file.type
    };

    const request = s3.putObject(params);

    // 📊 Track Progress
    request.on('httpUploadProgress', function (progress) {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        const progressBar = document.getElementById(`progress-${fileId}`);
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
    });

    request.send(async function (err, data) {
        if (err) {
            console.error("Upload Error:", err);
            markAsError(fileId, err.message);
        } else {
            console.log("S3 Upload Success", data);

            // 💾 Save Metadata to Firestore
            try {
                await addFileToFirestore({
                    uid: currentUser.uid,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    s3Key: s3Key,
                    url: null
                });

                // Refresh list to show the new file properly from Firestore
                setTimeout(() => loadUserFiles(currentUser.uid), 1000);

            } catch (dbError) {
                console.error("Firestore Error:", dbError);
                markAsError(fileId, "Saved to Cloud but DB failed.");
            }
        }
    });
}

async function loadUserFiles(uid) {
    fileListBody.innerHTML = '<tr><td colspan="4" class="empty-state">Loading your files...</td></tr>';

    try {
        const files = await getUserFiles(uid);

        if (files.length === 0) {
            fileListBody.innerHTML = `<tr><td colspan="4" class="empty-state">No files uploaded yet. Start now!</td></tr>`;
            return;
        }

        fileListBody.innerHTML = "";

        files.forEach(file => {
            // 🔑 Generate Signed URL
            const urlParams = {
                Bucket: BUCKET_NAME,
                Key: file.s3Key,
                Expires: 900 // 15 mins
            };
            const fileUrl = s3.getSignedUrl('getObject', urlParams);
            file.url = fileUrl; // Attach to object for display

            renderFileRow(file, false);
        });

    } catch (error) {
        console.error("Error loading files:", error);
        fileListBody.innerHTML = `<tr><td colspan="4" class="empty-state" style="color:red">Failed to load history.</td></tr>`;
    }
}

// ==========================================
// ✏️ EDIT / RENAME FUNCTION
// ==========================================
window.editFile = async function (docId, currentName) {
    const newName = prompt("Enter new name for file:", currentName);

    if (newName && newName !== currentName) {
        // Optimistic UI update? Or wait? Let's wait for simplicity.
        try {
            await updateFileName(docId, newName);
            // Reload list to reflect change
            loadUserFiles(currentUser.uid);
        } catch (e) {
            alert("Failed to rename file: " + e.message);
        }
    }
}


// ==========================================
// 🗑️ DELETE FUNCTION
// ==========================================
window.deleteFile = async function (fileName, docId) {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    if (!currentUser) return;

    // Reconstruct Key (Limitation: If we renamed the file ONLY in DB, we need the ORIGINAL key to delete from S3.
    // However, our current updateFileName ONLY updates the display name in Firestore.
    // Ideally we should store s3Key in Firestore separately from display 'name'.
    // `file.s3Key` from getUserFiles should be correct for deletion even if we change display name.
    // But `fileName` passed here is the DISPLAY name.
    // We need to fetch the doc again or pass the s3Key in the delete function.
    // Let's rely on the s3Key stored in the row dataset if possible, or just pass it in renderFileRow.

    // FIX: Passing s3Key directly to delete function now.
    // Wait, deleteFile receives (fileName, docId).
    // I will change it to receive (docId, s3Key).
}

window.deleteFileV2 = async function (docId, s3Key) {
    if (!confirm(`Are you sure you want to delete this file?`)) return;

    const params = {
        Bucket: BUCKET_NAME,
        Key: s3Key
    };

    // 2. Delete from S3
    s3.deleteObject(params, async function (err, data) {
        if (err) {
            console.error("S3 Delete Error:", err);
            alert("Failed to delete from Cloud: " + err.message);
        } else {
            // 3. Delete from Firestore
            try {
                await deleteFileFromFirestore(docId);

                // UI Remove
                const row = document.getElementById(docId);
                if (row) {
                    row.style.background = '#ffebe9';
                    setTimeout(() => row.remove(), 500);
                }
            } catch (dbError) {
                console.error("Firestore Delete Error:", dbError);
                alert("Deleted from S3 but failed to update DB.");
            }
        }
    });
}

// ==========================================
// 🎨 RENDER FUNCTION
// ==========================================
function renderFileRow(file, isUploading) {
    // file has: id, name, size, type, s3Key, createdAt, url (if loaded)
    const row = document.createElement('tr');
    row.id = file.id;
    row.className = 'fade-in';

    // Format Date
    let dateStr = "Just now";
    if (file.createdAt && file.createdAt.seconds) {
        dateStr = new Date(file.createdAt.seconds * 1000).toLocaleString();
    }

    if (isUploading) {
        row.innerHTML = `
            <td>
                ${file.name}
                <div class="progress-container">
                    <div id="progress-${file.id}" class="progress-fill"></div>
                </div>
            </td>
            <td>${formatBytes(file.size)}</td>
            <td>Uploading...</td>
            <td><span class="status-badge status-uploading">...</span></td>
        `;
        fileListBody.prepend(row);
    } else {
        row.innerHTML = `
            <td>
                <i class="fa-solid fa-file" style="color:#007bff; margin-right:8px;"></i>
                <span style="font-weight:500">${file.name}</span>
            </td>
            <td style="color:#666">${formatBytes(file.size)}</td>
            <td style="color:#888; font-size:0.85rem">${dateStr}</td>
            <td>
                <div class="action-buttons">
                    <a href="${file.url}" target="_blank" class="btn-open">
                        <i class="fa-solid fa-download"></i>
                    </a>
                    <button class="btn-edit" onclick="editFile('${file.id}', '${file.name}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteFileV2('${file.id}', '${file.s3Key}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        fileListBody.appendChild(row);
    }
}

function markAsError(id, msg) {
    const row = document.getElementById(id);
    if (!row) return;
    row.style.background = "#fff3cd"; // warning bg
    row.innerHTML = `<td colspan="4" style="color:red">Error: ${msg}</td>`;
}

function formatBytes(bytes, decimals = 2) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}