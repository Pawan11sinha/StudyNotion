
const Course=require ("../models/Course");
const Category=require("../models/Category");
const User =require("../models/User");
const {uploadImageToCloudinary}=require("../utils/imageUploader");
exports.createCourse=async(req,res)=>{
    try {
        // fetch data 
        const {courseName,courseDescription,whatYouWillLearn,price,Category}=req.body;
        // yha pe tag ek id hai model sei dekho 
        // get thumbnail
        const thumbnail=req.file.thumbnailImage;
        // validation
        if(!courseName||!courseDescription||!whatYouWillLearn||!price||!Category){
            return res.status(400).json({
                success:true,
                messag:"all fileds are required",
            })
        }
        // course schema mei instructor ki id chahiye uske liye db call mar rhe req.user.id
        // check for instructor yha pe db call. mar rhe inst k liye id lana h uski 
        const userId=req.user.id;
        const instructorDetails=await User.findById(userId);
        // TODO verify that userId and instructorDetails.id are same or different


        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"instructor details not found"
            })
        }
        // given Category is valid or not
        // yha pe body mei Category ki id aayi uske aadhar pe Categorydetail nikale
        // ye niche wala kiye kyunki may be postman sei koi dusra category aajaye jo ho hi na 
        const CategoryDetails=await Category.findById(Category)
        if(!CategoryDetails){
            return res.status(404).json({
                success:true,
                message:"Category detail not found"
            });
        }
        // upload image tag ccloudinary
        const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);
        // create an entry for enew course
        const newcourse=await Course( {
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            // ye CategoryDetails.id dalne k liye uppr category walla fetch kiyes
            Category:CategoryDetails.id,
            price,
            thumbnail:thumbnailImage.secure_url,

        })
// user update add te new course to user schema of instructor
await User.findByIdAndUpdate( 
    instructorDetails._id,
    { $push: { courses: newcourse._id }},
    { new: true }
);


// update the Category ka schema 
await Category.findByIdAndUpdate(
    CategoryDetails._id,
    { $push: { courses: newcourse._id }}
);

// return response
return res.status(200).json({
    success:true,
    message:"course created successfully",
    data:newcourse,
})


    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"failed to create the course",
            error:error.message
        })
    }
}

// getAllCourses handler function
exports.showAllCourses=async (req,res)=>{
    
    try {

    const allCourse=await Course.find({},{courseName:true,
        price:true,
        thumbnail:true,
        instructor:true,
        ratingAndReviews:true,
        studentsEnrolled:true,
    }).populate("instructor")
        .exec();

        return res.status().json({
            success:true,
            message:"data fetch successfully for all courses",
            data:allCourse
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            messag:'cannot getch course data',
            error:error.message,
        })
        
    }
}