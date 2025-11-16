const SubSection=require("..models/SubSection");
const Section =require("..models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create subsection
exports.createSubSection=async(req,res)=>{
    try {
        // fetch data
        const {sectionId,title,timeDuration,description}=req.body;
        //  extract file/video
        const video =req.files.videoFile;
        // validation
        if(!sectionId||!title||!timeDuration||!description){
            return res.status(400).json({
                success:false,
                message:"all fields are required",
            });
        }
        // upload video to cloudinary
        const uploadDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        // create a sub section
        const SubSectionDetails=await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        // update section with this subsection objecctid
        const updatedSection=await Section.findByIdAndUpdate({_id:sectionId},
                                                            {$push:{
                                                                SubSection:SubSectionDetails._id,
                                                            }},
                                                            {new:true}
        )
        // TODO log updated section after adding populate query 
        // return response

        return res.status(200).json({
            success:true,
            message:"sub section created successfully",
            updatedSection,
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"internal server error",
            error:message.error,


        })
        
    }
}
exports.updateSubSection = async (req, res) => {
  try {
    // data fetch
    const { title, SubSectionId, timeDuration, description } = req.body;

    // validation
    if (!SubSectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing properties",
      });
    }

    // update data
    const updatedSubSection = await SubSection.findByIdAndUpdate(
      SubSectionId,
      {
        title,
        timeDuration,
        description,
      },
      { new: true }
    );

    if (!updatedSubSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    // return response
    return res.status(200).json({
      success: true,
      message: "SubSection updated successfully",
      data: updatedSubSection,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// delete
exports.deleteSubSection =async(req,res)=>{
    try {
         // get id-assuming we are sending id in params
                const {SubSectionId}=req.params;
        
                // use findByIdAndDelete
                await SubSection.findByIdAndDelete(SubSectionId);
                // courseschema sei bhi delete kro 
                // TODO:do we need to delete the entry from the course schema?? testing mei dekhenge
                // res returbn
                return res.send(200).json({
                    success:true,
                    message:"SubSection deleted succesfully"
                })



    } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
        
    }
}