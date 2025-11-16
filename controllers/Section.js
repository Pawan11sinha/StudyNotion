const Section=require('../models/Section');
const Course =require("../models/Course");

exports.createSection =async (req,res)=>{
    try {
        // data fetch
        const{sectionName,courseId}=req.body;

        // data validation
        if(!sectionName||!courseId){
            return res.status(400).json({
                success:false,
                message:"missing properties",
            });
        }
        // create section
        const newSection=await Section.create({sectionName:sectionName})
        // update course with section odbjectId
        const updatedCourseDetails =await Course.findByIdAndUpdate(courseId,
                                                {
                                                    $push:{
                                                        courseContent:newSection.id,
                                                    }
                                                },
                                            {new:true},
                                        )

                                        // abhi uppr mie sirf id aayega pura object nhi aayega uks eliye populate use krna pdega 
        // return response 
        return res.status(200).json({
            success:true,
            message:"section created successfully",
            updatedCourseDetails,

        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to create section please try again",
            error:error.message
        })
    }
}

exports.updateSection =async(req,res)=>{
    try {
            // data fetch 
            const {sectionName,sectionId}=req.body;
            //  data validation
             if(!sectionName||!sectionId){
            return res.status(400).json({
                success:false,
                message:"missing properties",
            });
        }
            // update data
            const section=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

            // return res
            return res.status(200).json({
                success:true,
                message:"section update successful"
            })

        
    } catch (error) {
         return res.status(500).json({
            success:false,
            message:"unable to update section please try again",
            error:error.message
        })
        
    }
};

exports.deleteSection=async(req,res)=>{
    try {
        // get id-assuming we are sending id in params
        const {sectionId}=req.params;

        // use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);
        // courseschema sei bhi delete kro 
        // TODO:do we need to delete the entry from the course schema?? testing mei dekhenge
        // res returbn
        return res.send(200).json({
            success:true,
            message:"deleted succesfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"unable to update section please try again",
            error:error.message
        })
    }
}