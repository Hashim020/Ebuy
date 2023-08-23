
const Category = require('../Model/CatogoryModel');
const Product = require('../Model/ProductModel');
const path = require('path')


const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'views/admin/images'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now(); // Get the current timestamp
        const ext = path.extname(file.originalname); // Get the file extension
        const filename = uniqueSuffix + ext; // Construct the filename with timestamp and extension
        cb(null, filename);
    },
});

// Set up the multer middleware with size limit (in bytes)
const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB (adjust the size limit as needed)
    },
});

const addProduct = async (req, res) => {
    
    try {
        upload.array('images', 4)(req, res, async (err) => {
            if (err) {
                console.error(err); 
                return res.redirect('/admin/Productmmgmt'); 
            }

            // const { name, description, price, category } = req.body;
            const imageNames = req.files.map((file) => path.basename(file.path));
            const category = await Category.findOne({_id:req.body.category})

            const newProduct = new Product({
                name:req.body.name,
                description:req.body.description,
                price:req.body.price,
                category:category._id,
                stock:req.body.stock,
                offerprice:req.body.offerprice,

                images: imageNames,
            });

            const ProductResult = await newProduct.save();
            
        
            
           
            res.redirect('admin/Productmmgmt'); 

        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const Loadproduct= async(req,res)=>{
    try {
        const categories=await Category.find()
        const products= await product.find()
        res.render('Productmgmt',{categories,products}); // Pass the categories to the template
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}

const Loadprodutaddform= async(req,res)=>{
    try {
        const categories=await Category.find()
        res.render('addproduct',{categories}); // Pass the categories to the template
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}

module.exports={
    Loadproduct,
    addProduct,
    Loadprodutaddform

}