const multer = require('multer');
const path = require("path")
const fs = require("fs")

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        const uploadDir = "uploads/"
        fs.mkdirSync(uploadDir, { recursive: true })
        cb(null, uploadDir)
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now()+path.extname(file.originalname));
    }
})

const upload = multer({
  storage,
});

module.exports = upload

