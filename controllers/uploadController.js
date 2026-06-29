const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

exports.uploadHouseImages = async (req, res) => {

  try {

    if (!req.files || req.files.length === 0) {

      return res.status(400).json({

        message: 'Please upload at least one image.'

      });

    }

    if (req.files.length > 3) {

      return res.status(400).json({

        message: 'Maximum 3 images allowed.'

      });

    }

    const uploadedImages = [];

    for (const file of req.files) {

      const result = await new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(

          {

            folder: 'dairy_app/house_images',

            resource_type: 'image',

          },

          (error, result) => {

            if (error) {

              reject(error);

            } else {

              resolve(result);

            }

          },

        );

        streamifier.createReadStream(file.buffer)

            .pipe(uploadStream);

      });

      uploadedImages.push(result.secure_url);

    }

    return res.json({

      success: true,

      images: uploadedImages,

    });

  }

  catch (e) {

    console.error(e);

    return res.status(500).json({

      message: 'Image upload failed.'

    });

  }

};