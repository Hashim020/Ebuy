
const Category = require('../Model/CatogoryModel');
const Product = require('../Model/ProductModel');
const path = require('path')


const multer = require('multer');
const { rest } = require('lodash');


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
            
        
            
           
            res.redirect('Productmmgmt'); 

        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};








const Loadproduct= async(req,res)=>{
    try {
        const categories=await Category.find({},{_id:0,name:1})
        const products= await Product.find()
        res.render('Productmgmt',{categories,products}); // Pass the categories to the template
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}





const Loadprodutaddform= async(req,res)=>{
    try {
        var num=0;
        const categories=await Category.find()
        res.render('addproduct',{categories,num}); // Pass the categories to the template
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}





const listprocuts=async (req,res,id)=>{
    try {
        id=req.params.id
        const categories=await Category.findOne({_id:id},{name:1});
        const products=await Product.find({category:id,is_Listed:true});
        const categories1=await Category.find();

        
        res.render("Productlist",{categories,products,categories1})
    } catch (error) {
        
    }
}





const unlistproducts=async (req,res)=>{
    try {
        id=req.params.id;

        await Product.findByIdAndUpdate({_id:id},{$set:{is_Listed:false}})
        res.redirect("http://localhost:3000/admin/Productmmgmt")
    } catch (error) {
        
    }
}






const relistproducts=async (req,res)=>{
    try {
        id=req.params.id;

        await Product.findByIdAndUpdate({_id:id},{$set:{is_Listed:true}})
        res.redirect("http://localhost:3000/admin/Productmmgmt")
    } catch (error) {
        
    }
}







const producteditform=async (req,res)=>{
    try {
        const id=req.params.id
        const product = await Product.findOne({_id:id});
        const categories=await Category.find();
        // console.log(PRODUCTS,categories);
        res.render("editproducts",{product,categories})
        
    } catch (error) {
        console.log(error);
    }
}











const Proceedtoeditprdct =async(req,res)=>{
    try {
        upload.array('images')(req, res, async (err) => {
            if (err) {  
                console.error(err);
                return res.redirect('/admin');
            }
            var existingImages = req.body.existingImages || []
            const removedImages = req.body.removedImages || [];
            var newImages  = []
            for(let i=0;i<req.files.length;i++){
              if(req.files[i]!==undefined){
                newImages.push(req.files[i].filename)
              }
            }
            const remainingImages = existingImages.filter(image => !removedImages.includes(image));
        
  
            const productId = req.params.id;
            const existingProduct = await Product.findById(productId);
  
            const category = await Category.findOne({ _id: req.body.category });
  
            // Check if new images are uploaded
            // let newImageNames = existingProduct.images;
            // if (req.files && req.files.length > 0) {
            //     newImageNames = req.files.map((file) => path.basename(file.path));
            // }
  
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                {
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    category: category._id,
                    stock: req.body.stock,
                    offerprice: req.body.offerprice,
                    images:remainingImages.concat(newImages),
                },
                { new: true }
            );
  
            res.redirect('http://localhost:3000/admin/Productmmgmt');
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
}



const viewproducts=async (req,res)=>{
    try {
        const id=req.params.id;

        const categories1=await Category.find()
        const viewproduct=await Product.findOne({_id:id})
        const categories=await Category.findOne({_id:viewproduct.category})
        res.render("Viewproduct",{viewproduct,categories,categories1})
    } catch (error) {
        console.log(error);
    }
}
























module.exports={
    Loadproduct,
    addProduct,
    Loadprodutaddform,
    listprocuts,
    unlistproducts,
    relistproducts,
    producteditform,
    Proceedtoeditprdct,
    viewproducts

}