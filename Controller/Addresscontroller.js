const User = require('../Model/userModel')
const Address=require('../Model/AddressModel')




const Loadaddressmngmnt= async (req,res)=>{
    try {
        
        const _id= req.session.user_id;
        const userData =await User.findOne({_id:_id})
        const address= await Address.find({userId:_id})
        if(userData){
            res.render('useraddressmngmnt',{userData,address})
        }else{

        }
    } catch (error) {
        console.log(error);
    }
};







const saveaddress = async (req, res) => {
    try {
        const id=req.session.user_id
        const {name,mobile,landmark,city,district,state,pincode,address}=req.body
        const data =new Address({
            name,
            mobile,
            landmark,
            district,
            state,
            pincode,
            address,
            city,
            userId:id
        });
        await data.save();
        res.redirect('http://localhost:3000/MyAccount-address')
    } catch (error) {
        console.log(error.message)
    }
};

const saveaddresscheckout = async (req, res) => {
    try {
        const id=req.session.user_id
        const {name,mobile,landmark,city,district,state,pincode,address}=req.body
        const data =new Address({
            name,
            mobile,
            landmark,
            district,
            state,
            pincode,
            address,
            city,
            userId:id
        });
        await data.save();
        res.redirect('http://localhost:3000/Checkout')
    } catch (error) {
        console.log(error.message)
    }
};



module.exports={
    Loadaddressmngmnt,
    saveaddress,
    saveaddresscheckout,
}