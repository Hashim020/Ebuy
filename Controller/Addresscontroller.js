const User = require('../Model/userModel')
const Address=require('../Model/AddressModel');
const { findById } = require('../Model/CatogoryModel');




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

const RemoveAddres = async (req, res) => {
    try {
      const ID = req.params.id;
      const deleted = await Address.findOneAndDelete(ID);
      if (deleted) {
        res.json({ Deleted: true, Message: 'Address deleted successfully' });
      } else {
        res.json({ Deleted: false, Message: 'Address not found' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ Deleted: false, Message: 'Internal Server Error' });
    }
  };

  const GetEditAddress=async(req,res)=>{
    try {
        const id=req.params.id;
        const address= await Address.findById(id);
        // console.log(address);
        if(address){
            res.render('Edit-Address',{address})
        }else{
            res.json({EditFalse:true})
        }
    } catch (error) {
        
    }
  }

  const PostEditAddress = async (req, res) => {
    try {
        const { ID, name, mobile, landmark, city, state, pincode, district, address } = req.body;
        if (ID) {
            const updatedAddress = await Address.findByIdAndUpdate(ID, {
                name: name,
                mobile: mobile,
                landmark: landmark,
                city: city,
                state: state,
                pincode: pincode,
                district: district,
                address: address
            }, { new: true });

            if (updatedAddress) {
                res.redirect('/MyAccount-address')
            } else {
                res.json({ updated: false, message: 'Address not found' });
            }
        } else {
            res.json({ updated: false, message: 'Invalid ID' });
        }
    } catch (error) {
        console.log(error)
    }
}

  

module.exports={
    Loadaddressmngmnt,
    saveaddress,
    saveaddresscheckout,
    RemoveAddres,
    GetEditAddress,
    PostEditAddress
}