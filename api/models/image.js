const router = require('express').Router()
const multer = require('multer');
const { User, Product, School, Image, Tag } = require("../../db");
module.exports = router
const {uploadFile} = require('../s3')
const { requireFBUser } = require('../gateKeeper')

// const Storage = multer.memoryStorage()
// const upload = multer({ storage: Storage , limits: { fieldSize: 2 * 1024 * 1024 }});
var upload = multer({ dest: 'uploads/' }); //setting the default folder for multer
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const { getFileStream, deleteImage , presignedGETURL} = require("../../schema/s3");

router.get("/:key", requireFBUser, async (req, res, next) => {
    try {
        const key = req.params.key;
        if (!key.length || key.length < 20) {
        res.status(4).send("no imagePath send");
        }
        // const imageUri = presignedGETURL(key)
        const readStream = await getFileStream(key);
        readStream.pipe(res);
    } catch (error) {
        next(error);
    }
});

router.post("/", requireFBUser, upload.single('fileData'), async (req, res,next) => {
    const file = req.file;
    const { productId } = req.body
    try {
    const result = await uploadFile(file);
    await unlinkFile(file.path);

    res.status(200)
    .send({ imagePath: `${result.Key}` });
    } catch (err) {
            console.log("err", err);
            next(err);
    }
});


router.post('/paths', requireFBUser, async(req,res,next)=>{
    try {
        console.log('apth--->', req.body)
        const imagePost = await Image.create(req.body)
        res.send(imagePost)
    } catch (error) {
        next(error)
    }
})

router.post("/save",requireFBUser, async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const { images, productId } = req.body
        const imagesSaved = await Image.bulkCreate(images);
        for (let i=0;i<images.length;i++){
            await imagesSaved[i].addProduct(productId)
        }
        res.send(imagesSaved);
    } catch (error) {
        console.log('error saving images-->', error)
        next(error);
    }
});

router.delete("/:imagePath", requireFBUser, async (req, res, next) => {
    try {
        const imagePath = req.params.imagePath;
        const userId = req.user.id;

        // destory from Images table
        const image = await Image.destroy({
            where: {
                imagePath,
            },
        });

        // destory from s3
        await deleteImage(imagePath);

        res.status(200).send();
    } catch (error) {
        next(error);
    }
});

