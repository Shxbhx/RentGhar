const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory (RAM)

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB per file
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    },
});

module.exports = upload;

// const storage = multer.memoryStorage(); // Store images in memory

// app.post("/addProperty", upload.array("images", 5), async (req, res) => {
//     const imageBase64Array = req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`);
//     const property = new Property({ images: imageBase64Array });
//     await property.save();
//     res.json({ message: "Property added successfully!" });
// });

 