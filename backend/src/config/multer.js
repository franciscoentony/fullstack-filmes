import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração de onde e como o arquivo será salvo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath); // As imagens irão para a pasta /uploads
  },
  filename: (req, file, cb) => {
    // Gerando um nome único: timestamp + nome original
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  }
});

export const upload = multer({ storage });