const isLogin= async(req,res,next)=>{
    try {

        if(req.session.admin_id){
            next();
        }
        else{
            res.redirect('/admin');
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout= async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/admin/home')
        }else{
            next();
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
}
const is_admin= async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/')
        }else{
            next();
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
}




module.exports={
    isLogin,
    isLogout,
    is_admin
}