const SubSection  = require("../models/SubSection");
const  Section  = require("../models/SubSection");
const imageUploadCloudinary =require("../utils/imageUploader")
exports.createSubsection = async (req,res)=>{
    try {
        
        // fetch data from body 
        const {sectionId,title,timeDuration,description} =req.body;
        // extract file/video
        const video =req.files.videoFile;
        //  validation
        if(!sectionId || !title || !video|| !timeDuration || !description){
            return res.status(400).json({success:false,message:"Please fill all fields"});
        }
        // upload video to cloudINary
        const uploadDetails = await imageUploadCloudinary(video,process.env.FOLDER_NAME)
        // create to sucSection
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:`${uploadDetails.duration}`,
            description:description,
            videoUrl:uploadDetails.secure_url,
        });
        // update section with this  sub section objectId
const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                        {$push:{
                                            subSection:subSectionDetails._id,
                                        }},{new:true}
                                        ).populate("subSection")
          
    
         

        // return res 
         return res.status(200).json({
            success: true,
            message: "subsection created SuccessFully",
            data: updatedSection,
         })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"internal server error",
            error:error.message
        })
    }
}


exports.updateSubSection = async (req,res) =>{
    try {
        // data fetch from body 
        const {sectionId , title,description } =req.body;
        const subSection = await SubSection.findById(sectionId);

        // validation check
        if(!subSection){
            return res.status(400).json({
            success:false,
            message: "SubSection not found",

            })
        }


        if(title !== undefined){
            subSection.title =  title
        }

        if(description != undefined){
            subSection.description= description;

        }

        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await imageUploadCloudinary(
              video,
              process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
          }
      
          await subSection.save()
      
          return res.json({
            success: true,
            message: "Section updated successfully",
          })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "an error occurred while updating the section"
        })
    }
}


exports.deleteSubSection = async (req,res)=>{
    try {
        
        const {sectionId,subSectionId} = req.body;
        await Section.findByIdAndDelete(
            {_id: sectionId},
            {$push:{
                subSection :subSectionId
            }}
        )

        const subSection =await SubSection.findByIdAndDelete({_id:subSection})

        if(!subSection){
            return res
            .status(404).json({
                success:false,
                message:"subSection Not found"
            })
        }

        return res.json({
            success: true,
            message: "SubSection deleted successfully",
          })

    } catch (error) {
         console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
}
   
