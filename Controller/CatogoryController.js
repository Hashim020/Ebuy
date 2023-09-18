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

        const namecheck=await Category.find({name:Categoryname});
        if(namecheck.length===0){
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
    }else{
        const categories = await Category.find();
        res.render("catogory",{message:"CANNOT ADD!!!!",categories})
    }
    } catch (error) {
        console.error(error);
        res.render("catogory", { message: 'Fail to save Category.' });
    }
}

const Editcatgory = async (req,res) => {
   
    try {

        const categories= await Category.find({_id:req.params.id})
        res.render("editcategory",{categories})
    } catch (error) {
        
    }

}

const submiteditcatgory= async(req,res)=>{
    try {
        const { id, newname, newdescription } = req.body;

        // Assuming you're using Mongoose
        await Category.findByIdAndUpdate(
            { _id: id },
            { $set: { name: newname, description: newdescription } }
        );

        const categories = await Category.find();
        res.redirect("Catogory"); // Check the correct redirect URL
    } catch (error) {
        console.log("Error:", error);
    }
}



module.exports = {
    addcatogory,
    Loadcatogory,
    Editcatgory,
    submiteditcatgory,
};