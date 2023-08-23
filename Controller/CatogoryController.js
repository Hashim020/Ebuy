const Category = require('../Model/CatogoryModel');


const Loadcatogory= async(req,res)=>{
    try {
        const categories = await Category.find().sort({name:1}); // Fetch all categories from the database
        res.render('Catogory', { categories }); // Pass the categories to the template
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}

const addcatogory = async (req, res) => {
    try {
        const { Categoryname, Categorydescription } = req.body;

        // Create a new Category instance
        const newCategory = new Category({
            name: Categoryname,
            description: Categorydescription
        });

        // Save the new category to the database
        await newCategory.save();

        // Fetch all categories from the database
        const categories = await Category.find();

        // Send a success response with the categories data
        res.render("catogory", {message:"New Category Added Successfully", categories });
    } catch (error) {
        console.error(error);
        res.render("catogory", { message: 'Fail to save Category.' });
    }
}

const updateCategory = async (req,res) => {
   
    try {
        const id=req.params._id
        const newCategory=req.body
        res.render("catogory",{categories})
    } catch (error) {
        console.log(error);
    }

}



module.exports = {
    addcatogory,
    Loadcatogory,
    updateCategory,
};