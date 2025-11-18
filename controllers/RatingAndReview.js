const RatingAndReview=require("../models/RatingAndReviews");
const Course= require("../models/Course");
const { default: mongoose } = require("mongoose");

// createRating
exports.createRating=async (req,res)=>{
    try {
        // get userId 
        const userId=req.user.id;
        // fetchdata from req body 
        const {rating ,review,courseId}=req.body;
        // check  if user is enrolled or not
        const courseDetails =await Course.findOne(
                                    {_id:courseId,
                                    studentsEnrolled:{$elemMatch:{$eq:userId}},
                                    
                                    })
            if(!courseDetails) {
                return res.status(404).json({
                    success:false,
                    message:"student is not enrolled in this course"
                })
            }                       
        // check if user already reviewed the course
        // agr ratingandreview k andr dono courseid aur userid pda h toh pehle sei rivewed h
        const alreadyReviewed =await RatingAndReview.findOne({
                                        user:userId,
                                        course:courseId,
        });
         if(!alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"course is already reviewed by the user"
            })
        }
        // create rating and review
        const ratingReview=await RatingAndReview.create({
            rating,review,course:courseId,
            user:userId,
        })
       
        // update course with this rating and review
       const updatedCourseDetails= await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push:{
                                            ratingAndReviews:ratingReview._id,
                                        },
                                         },
                                         {new:true}
                                        
                                      

       
    );
    console.log(updatedCourseDetails);
        // return response
        return res.status(200).json({
            success:true,
            message:"rating and reviews create suxxessfully",
            ratingReview
        })
    } catch (error) {
        console.log(error);
       return res.status(500).json({
            success:false,
            message:error.message,
       })

    }
}

// getaverageRating

exports.getAverageRating=async(req,res)=>{
    try {
        // get course Id
        const courseId=req.body.courseId;
        // calculate avg rating
        // yha pe iss courseid sei related saraa reviewand rating nikal liye jis jis review mei iss courseid pda hoga wo aagya 
        // saari entry aagyi ratingandreview ki jo ye courseid containe kr rha
        const result=await RatingAndReview.aggregate([
             {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
             },

            //  group krna
            // yha pe saraa rating ko ek group mei merge krdiye phir avg rating calculate krlo
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},
                }
            }
        ])
        // return rating
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }
        // if no ratin/review exist
        return res.status(200).json({
            success:true,
            message:"average rating is 0 , no rating given till now",
            averageRating:0,

        })
    } catch (error) {
         console.log(error);
       return res.status(500).json({
            success:false,
            message:error.message,
       })
        
    }
}




// getAllRatingandreviews ye generic hai koi course specific nhi h
exports.getAllRating=async(req,res)=>{
try {
    const allReviews=await RatingAndReview.find({})
    // des order se aayega reviews sort kiye h 
                                    .sort({rating:"desc"})
                                    .populate({
                                        path:"user",
                                        // yha pe populate kiye h objid sirf nhi aaega 
                                        // aur firstname ast email yhi sb user sei aayega aur kuch nhi 
                                        select:"firstName lastName email image"
                                    })
                                    .populate({
                                        path:"course",
                                        // sirf coursename hi aayega course sei aur kuch nhi 
                                        select:"courseName",
                                    })
                                    .exec();
             return res.status(200).json({
                success:true,
                message:"all reviews fetched successfully",
                data:allReviews
             })                       
    
} catch (error) {
    console.log(error)
}
}