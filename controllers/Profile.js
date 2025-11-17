const User=require("..models/User");
// yha pe create profile krne ki jarurt nhi signup wale mei pehle hi false se intialise krdiye the toh sirf update krna pdega 
// agr nhi kiye hote to create kr k push krte user wale mei 
const Profile =require("../models/Profile")

exports.updateProfile=async(req,res)=>{
    try {
        // get daata
        // ="" ye wala likhe kyunki optional tha
        const {dateOfBirth="",about="",contactNumber,gender}=req.body;
        // get userId login krne time mila tha
        const id=req.user.id;

        // validation
        if(!contactNumber||!gender){
            return res.status(400).json({
                success:true,
                message:"all fields are required",
            })
        }
        // find profile phaile user id sei userdetails laye phir additionaldetails laye usko profile mei check kiye
    //   agr profile create nhi hua hota to create krte phir user mei dal dete  
        const userDetails=await User.findById(id);
       const profileId=userDetails.additionalDetails;
       const profileDetails=await Profile.findById(profileId)
        // uupdate profile 2 method h ek create aur ek save yha pe object bna hua h save method ka use kro 
        profileDetails.dateOfBirth=dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender=gender;
        profileDetails.contactNumber=contactNumber;
        await profileDetails.save();
        return res.status(200).json({
            success:true,
            message:"profile update successful",
            profileDetails,
        })

        // return response
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"profile update nhi hua ",
            error:error.message
        })
    }
}

// how to schedule request delete accoubt immediately nhi krna chahta hu 

// delete account
exports.deleteAccount=async(req,res)=>{
    try {
        // get id
        const id=req.user.id
        // validation
        const user=await User.findById(id);
        if(!user){
            return res.status(404).json({
                success:false,
                message:"user nhi hai "
            })
        }
        // delete profile
         const profileId=userDetails.additionalDetails;
        await Profile.findByIdAndDelete(profileId)
        // delete user
        // TODO HW unenrolled user from all enrolled courses
        // cron job kya hota ye pta kro

        await User.findByIdAndDelete({_id:id});
      
        // return response
        return res.status(200).json({
            success:true,
            message:"deleted successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"user cannot be deleted account"
        })
    }
}

exports.getAllUserDetails=async(req,res)=>{
    try {
        const id=req.user.id;
        // agr populate use nhi krte to pura details nhi aata sirf id aajata additionaldetails ka
        const userDetails=await User.findById(id).populate("additionalDetails").exec()
        return res.status(200).json({
            success:true,
            message:"user data fetched successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,

        })
    }
}