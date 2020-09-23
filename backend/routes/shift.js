const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const userauth = require("../middleware/userauth");
const { check, validationResult } = require("express-validator");
const Shift = require("../models/Shift");
const createShift = require("../models/createShift");
const User = require("../models/User");
var nodemailer = require("nodemailer");

var bodyParser = require('body-parser');
var multer = require('multer');
router.use(bodyParser.json());
//@route  GET api/shift/getshift
//@desc   Get all shift
//@access Public

router.get("/getshifts", (req, res) => {
  Shift.find().then((allShift) => {
    res.send(allShift);
  });
});

//@route  DELETE api/shift/deleteshift
//@desc   Delete shift by id
//@access Public
router.delete("/deleteshift", (req, res) => {
  Shift.findOneAndDelete({ _id: req.query.id }).then((resp) => {
    console.log(resp);
    res.send(resp);
  });
});

router.delete("/deleteshiftUser", (req, res) => {
  createShift.findOneAndDelete({ _id: req.query.id }).then((resp) => {
    console.log(resp);
    res.send(resp);
  });
});

router.delete("/deleteAllShifts", (req, res) => {
  createShift.deleteMany().then((resp) => {
    console.log(resp);
    res.send(resp);
  });
});



router.delete("/deleteCurrentShift/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  createShift.remove({_id:id})
  .exec()
  .then(result => {
    Shift.findById(id)
    .exec()
    .then(shift => {
      console.log(shift)
      if(result.deletedCount>0){
        res.status(201).json({
          message : "shift deleted successfully"
        })
      }
      else{
        res.status(404).json({
          message : "no shift found"
        })
      }
    })
    .catch(err=> {
      res.status(500).json({
        error : err
      })
    })
    
  })
  .catch(err=>{
    res.status(500).json({
      error : err
    })
  })
  // Shift.findByIdAndDelete({ _id: req.params.id }).then((resp) => {
  //   console.log(resp);
  //   res.send(resp);
  // });
});



router.get("/getUserByName/:id",async (req,res) => {
  const id = req.params.id;
  
  var shiftsList = [];
  console.log("Name searched with id = "+id);

    createShift.find({userId: id}).populate('userId').populate('shiftTypeId').exec().then(async (shifts) => {

// await      Shift.find()
//       .exec()
//       .then(shiftsObj => {
//         console.log(shiftsObj);
//       })
//       .catch(err=> {
//         res.status(500).json({
//           error : err
//         })
//       })

      


      // res.send(shfts);
      console.log(shifts);
      res.status(200).json({
        shifts : shifts.map(shift => {
          console.log(shift.title)
          return {
            _id : shift._id,
            start : shift.start,
            end : shift.end,
            title : shift.shiftTypeId.shiftname + ":"+ " " +shift.userId.firstName.charAt(0) +" " +shift.userId.lastName,
            color : shift.shiftTypeId.color,
            swapable: shift.swapable
          }
        })
      })
    });
  
  
})


router.post("/createShift", (req, res) => {
  console.log(req.body);
  if (req.body === null) res.status(400).send("Bad Request");
  let newShift = new createShift({
    // _id : 
    userId : req.body.userId,
    start: req.body.start,
    end: req.body.end,
    shiftTypeId: req.body.shiftTypeId,
    swapable: req.body.swapable,
    comment: req.body.comment
  });

  console.log("Shift created as: "+newShift)
  newShift
    .save()
    .then((newShift) => res.send(newShift))
    .catch((err) => console.log(err));
});

//Restriction of swap and unswap
// router.put('/restrict-swap/:id/:toggler', (req, res, next) => {
//   const thing = new createShift({
//     _id: req.params.id,
//     swapable: req.params.swapable
//   });
//   createShift.updateOne({_id: req.params.id}, thing).then(
//     () => {
//       res.status(201).json({
//         message: 'Thing updated successfully!'
//       });
//     }
//   ).catch(
//     (error) => {
//       res.status(400).json({
//         error: error
//       });
//     }
//   );
// });

router.get('/restrict-swap/:id/:swapable',(req,res)=>{
  const id = req.params.id;
  createShift.findById(id)
 .exec()
 .then(shift => {
    shift.swapable = req.params.swapable;
    shift.save()
    .then(shiftObj => {
      res.status(201).json({
        message : "shift updated successfully",
        shift : shiftObj
      })
    })
    .catch(err=> {
      res.status(500).json({
        error : err
      })
    })
 })
 .catch(err=> {
   res.status(500).json({
     error : err
   })
 }) 
});



router.get("/specificDateOffEvents/:date" , (req,res) => {
  const dataCheck = req.params.date;
  createShift.find({
    start: dataCheck
  })
  .populate('userId')
  .populate('shiftTypeId')
  .exec()
  .then(shifts => {
    res.status(200).json({
      shifts : shifts.map(shift => {
        if(shift.shiftTypeId.shiftname === 'Off'){
          return {
            _id : shift._id,
            start : shift.start,
            priority : shift.shiftTypeId.priority,
            //shiftTypeId: shift.shiftTypeId,
            end : shift.end,
            title : shift.userId.firstName+" " +shift.userId.lastName,
            color : shift.shiftTypeId.color,
            swapable: shift.swapable,
            shifname: shift.shiftTypeId.shiftname,
            comment: shift.comment,
            status: 'Approved'
          }
        }
        
        })
      })
    })
    .catch(err=> {
      res.status(500).json({
        error : err
      })
})
})

router.get("/AllOffEvents" , (req,res) => {
  createShift.find()
  .populate('userId')
  .populate('shiftTypeId')
  .exec()
  .then(shifts => {
    res.status(200).json({
      shifts : shifts.map(shift => {
        if(shift.shiftTypeId.shiftname === 'Off'){
          return {
            _id : shift._id,
            start : shift.start,
            priority : shift.shiftTypeId.priority,
            //shiftTypeId: shift.shiftTypeId,
            end : shift.end,
            title : shift.userId.firstName+" " +shift.userId.lastName,
            color : shift.shiftTypeId.color,
            swapable: shift.swapable,
            shifname: shift.shiftTypeId.shiftname,
            comment: shift.comment
          }
        }
        
        })
      })
    })
    .catch(err=> {
      res.status(500).json({
        error : err
      })
})
})

router.get("/currentShifts", (req, res) => {
  createShift.find()
  .populate('userId')
  .populate('shiftTypeId')
  .exec()
  .then(shifts => {
    // userId, start, end, title, color
    res.status(200).json({
      shifts : shifts.map(shift => {
        return {
          _id : shift._id,
          start : shift.start,
          priority : shift.shiftTypeId.priority,
          //shiftTypeId: shift.shiftTypeId,
          end : shift.end,
          title : shift.shiftTypeId.shiftname + ":"+ " " +shift.userId.firstName.charAt(0) +" " +shift.userId.lastName,
          color : shift.shiftTypeId.color,
          swapable: shift.swapable,
          comment: shift.comment
        }
      })
    })
  })
  .catch(err=> {
    res.status(500).json({
      error : err
    })
  })
  // createShift.find().populate('userId').exec().then((shfts) => {
  //   res.send(shfts);
  // });
});

router.get("/currentUserShifts/:id", (req, res) => {
  const id = req.params.id;
  createShift.find({userId : id})
  .populate('userId')
  .populate('shiftTypeId')
  .exec()
  .then(shifts => {
    // userId, start, end, title, color
    res.status(200).json(
       shifts.map(shift => {
        return {
          _id : shift._id,
          start : shift.start,
          end : shift.end,
          title : shift.shiftTypeId.shiftname + ":"+ " " +shift.userId.firstName.charAt(0) +" " +shift.userId.lastName,
          color : shift.shiftTypeId.color,
          swapable: shift.swapable
        }
      })
    )
  })
  .catch(err=> {
    res.status(500).json({
      error : err
    })
  })
  // createShift.find().populate('userId').exec().then((shfts) => {
  //   res.send(shfts);
  // });
});

// router.get("/currentUserShifts", (req, res) => {
//   if (req.query === null) res.status(400).send("Bad Request");
//   createShift.find({ title: { $regex: req.query.username } }).then((shfts) => {
//     res.send(shfts);
//   });
// });



router.get("/currentUserOffShifts/:id", async(req, res) => {
  const id = req.params.id;
  var offId;
  await Shift.findOne({shiftname:"Off"})
  .exec()
  .then(obj => {
    offId = obj._id
  })
  .catch(err=>{
    res.status(500).json({
      error : err
    })
  })
  await createShift.find({userId : id, shiftTypeId : offId})
  .populate('userId')
  .populate('shiftTypeId')
  .exec()
  .then(shifts => {
    res.status(200).json(
      shifts.map(shift => {
       return {
         _id : shift._id,
         start : shift.start,
         end : shift.end,
         title : shift.shiftTypeId.shiftname + ":"+ " " +shift.userId.firstName.charAt(0) +" " +shift.userId.lastName,
         color : shift.shiftTypeId.color,
         swapable: shift.swapable
       }
     })
   )
  })
  .catch(err=> {
    res.status(500).json({
      error : err
    })
  })
 
});

router.put("/swapShifts", (req, res) => {
  if (req.body === null) res.status(400).send("Bad Request");
  try {
    createShift
      .replaceOne(
        { _id: req.body.id1 },
        { title: req.body.title1, start: req.body.start1, end: req.body.end1 }
      )
      .then(
        () => {
        createShift
          .replaceOne(
            { _id: req.body.id2 },
            {
              title: req.body.title2,
              start: req.body.start2,
              end: req.body.end2,
            }
          )
          .then(() => {
            User.find({
              $or: [
                { username: { $regex: req.body.title1.split(" ")[0] } },
                { username: { $regex: req.body.title2.split(" ")[0] } },
              ],
            }).then((user) => {
              sendMail(
                user[0].email,
                user[1].email,
                req.body.title1.toString(),
                req.body.title2.toString()
              );
              res.send("Shifts are swapped");
            });
          });
      });
  } catch (err) {
    console.log(err);
  }
});
async function sendMail(user1, user2, title_1, title_2) {
  var transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      // enter your account details to send email from
      user: "",
      pass: "",
    },
  });

  var mailOptions = {
    from: "",
    to: "",
    subject: "Shift Transfer Log",
    html:
      "<p> This mail sent as shift transfer log. <br/> Shift <b>" +
      title_1 +
      "</b> to this <b>" +
      title_2 +
      "</b> </p>",
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}

//@route  PUT api/shift/updateshift
//@desc   Update shift by id
//@access Public
router.put(
  "/updateshift",
  [
    check("shiftname", "Please enter a valid name.").not().isEmpty(),
    check("editable", "Please enter an editable option.").not().isEmpty(),
    check("priority", "Please enter an priority option.").not().isEmpty(),
    // shiftname must be an email
    check("color", "Please enter a valid color.").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      let newPerson = {
        shiftname: req.body.newData.shiftname,
        color: req.body.newData.color,
        editable: req.body.newData.editable,
        priority: req.body.newData.priority,
      };

      Shift.update({ _id: req.body.id }, { $set: newPerson }).then((resp) => {
        console.log(resp);
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

//@route  POST api/shift/register
//@desc   Register New Shift
//@access Public
router.post(
  "/register",
  [
    check("shiftname", "Please enter a valid name.").not().isEmpty(),
    check("editable", "Select for editable option").not().isEmpty(),
    check("priority", "Select for priority option").not().isEmpty(),
    // shiftname must be an color
    check("color", "Please enter a valid color.").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      //check if shift exists

      Shift.findOne({ shiftname: req.body.shiftname }).then((person) => {
        if (person) {
          return res.status(400).json({ email: "Shift already exists!" });
        } else {
          let newPerson = new Shift({
            shiftname: req.body.shiftname,
            color: req.body.color,
            editable: req.body.editable,
            priority: req.body.priority,
          });

          newPerson
            .save()
            .then((newperson) => res.json({ newperson }))
            .catch((err) => console.log(err));
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;


router.get("/swapShift/:id1/:id2", (req,res,next) => {
  const id1 = req.params.id1;
  const id2 = req.params.id2;
  var shift1;
  createShift.findById(id1)
  .exec()
  .then(shift1Obj => {
    shift1 = shift1Obj.userId;
      createShift.findById(id2)
      .exec()
      .then(shift2Obj => {
        shift1Obj.userId = shift2Obj.userId;
        shift2Obj.userId = shift1;

        shift1Obj.save()
        .then(result1 => {
        
          shift2Obj.save()
        .then(result2 => {
            res.status(201).json({
              shift1 : result1,
              shift2 : result2
            })
        })
        .catch(err=> {
          res.status(500).json({
            error : err
          })
        })

        })
        .catch(err=> {
          res.status(500).json({
            error : err
          })
        })

      })
      .catch(err=> {
        res.status(500).json({
          error :err
        })
      })
  })
  .catch(err=> {
    res.status(500).json({
      error : err
    })
  })



})