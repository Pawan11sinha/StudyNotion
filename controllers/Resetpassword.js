const User =require("../models/User");
const mailSender =require("../utils/mailSender");
const bcrypt=require("bcrypt")

// resetPasswordToken

exports.resetPasswordToken=async(req,res)=>{
try {
    // get email from req body
const email=req.body.email;
// check user for this email validation
const user =await User.findOne({email:email});
if(!user){
    return res.json({success:false,
        message:'your email is not registered with us'})
}
// generate token
const token =crypto.randomUUID;
// update user by adding token and expiration time
const updateddetails=await User.findOneAndUpdate(
                                    {email:email},
                                     {token:token,
                                    resetPasswordExpires:Date.now()+5*60*1000},
                                    {new:true});
// create url
const url =`https://localhost:3000/update-password/${token}`
// send email
await mailSender(email,
    "Passwordresetlink",
    `password reset link:${url}`
    
)
// return response
return res.json({
    success:true,
    message:`Email sent successfully please check email and change pwd`
});


} catch (error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"something went wrong while sending reset pwd email "
    });
    
}

}

// resetPassword
// token k aadhar pe user ko fetch kr k la rhe h 
exports.resetPassword=async(req,res)=>{
   try {
     // data fetch
    const {password,confirmpassword,token}=req.body;
    // validation
    if(password!==confirmpassword){
        return res.json({
            success:false,
            message:"password not matching"
        })
    }
    // get userdetails from db using token 
    const userDetails=await User.findOne({token:token});
    //  if no entry invalid token
    if(!userDetails){
        return res.json({
            success:false,
            message:"token is invalid",
        })
    }
    // token time expire
    if(userDetails.resetPasswordExpires<Date.now()){
            return res.json({
                success:false,
                message:"token is expired please regenerate your token "
            })
    }
    // hash pwd
const hashedPassword=await bcrypt.hash(password,10);

    // password update
    await User.findByIdAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true},
    );
    // returb response
    return res.json({
        success:true,
        message:"Password reset succesful"
    })
   } catch (error) {
     console.log(error);
    return res.status(500).json({
        success:false,
        message:" "
    });
    
    
   }
}