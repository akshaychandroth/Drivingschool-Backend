const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Student = require('./model/student')
const RemoteStudent = require('./model/remotestudent')
const RemoteTutor = require('./model/remotetutor')
const SuperUser= require('./model/Superuser')
const Collection = require('./model/Collection')
const Tutor = require("./model/tutor")
const Car = require('./model/Car')
const Package = require('./model/Package')
const Session = require('./model/Session')
const Selection=require('./model/Selection')
const Rating = require('./model/Rating')



const app = express()
app.use(express.json())
app.use(cors({
    origin:["http://localhost:3000"],
    methods :["GET","POST","PUT" , "DELETE"],
    credentials:true
}))


mongoose.connect('mongodb://localhost:27017/drivingschool')


app.listen(8000,()=>{
    console.log("server is Running");
})

// student registration




app.post('/studentregister', async (req, res) => {
  const { name, address,phone, email,username,password,role } = req.body;

  try {
    const existingUser = await Collection.findOne({ username:username});

    if (existingUser) {
      return res.json({ status: 'Username already exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    const CommonAuth = await Collection.create({
      username,
      role,
      password: hash,
    });

    let newUser;

    if (role === 'student') {
      newUser = await Student.create({
          commonAuth: CommonAuth._id,
        name,
        address,
        phone,
        email
      });
    } else if (role === 'remotestudent') {
      newUser = await RemoteStudent.create({
          commonAuth: CommonAuth._id,
        name,
        address,
        phone,
        email
      });
    } 

    console.log('New user created:', newUser);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err.message);
    res.json({ status: 'Error during registration' });
  }
});


// tutor register by admin



app.post('/localtutor', async (req, res) => {
  const { id,name, address,phone,email,idcard,username,password,role } = req.body;

  try {
    // Check if the email already exists in userauth
    const existingUser = await Collection.findOne({ username:username });

    if (existingUser) {
      return res.json({ status: 'Username already exists' });
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    // Create a new user in userauth
    const CommonAuth = await Collection.create({
      username,
      role,
      password: hash,
    });
    
    const tutor = await Tutor.create({
      id,
      commonAuth: CommonAuth._id,
      name,
      address,
      phone,
      email,
      idcard
    
    });

    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err.message);
    res.json(err);
  }
});



// register for remoteTutor



app.post('/remotetutorreg',async (req,res)=>{

  const {id, name, address,phone,email,idcard,username,password,role } = req.body;


  try{
    const existingUser = await Collection.findOne({ username:username });

    if (existingUser) {
      return res.json({ status: 'Username already exists' });
    }
    
     // Hash the password
     const hash = await bcrypt.hash(password, 10);

     // Create a new user in userauth
     const CommonAuth = await Collection.create({
       username,
       password: hash,
      role,
     });
     const remotetutor = await RemoteTutor.create({
      commonAuth: CommonAuth._id,
      id,
      name,
      address,
      phone,
      email,
      idcard
    
    });

    res.json({ status: 'ok' });



  }catch (err) {
    console.error(err.message);
    res.json(err);
  }

})




// Admin register




app.post('/adminregister', async (req, res) => {
  const {username,password,role } = req.body;

  try {
    const existingUser = await Collection.findOne({ username:username });

    if (existingUser) {
      return res.json({ status: 'Username already exists' });
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    // Create a new user in userauth
    const NewCommonAuth = await Collection.create({
      username,
      password: hash,
      role
    });
    
    const admin = await SuperUser.create({
      commonAuth: NewCommonAuth._id,
      
    
    });

    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err.message);
    res.json(err);
  }
});



// Login for all users



app.post('/login',(req,res)=>{
  const {username , password} = req.body
  Collection.findOne({username:username})
  .then(user=>{
      if(user){
          bcrypt.compare(password , user.password , (err , response)=>{
              if(response){
                  const token = jwt.sign({email:user.username , role:user.role  },
                      "jwt-secret-key" ,{expiresIn:'1d'})


                      

                      
                      res.cookie('token',token)
                      return res.json({Status : "Success" ,id:user._id,username:user.username, role :user.role,  status:user.status })

              }else{
                  return res.json("the password is incorrect")
              }
          })

      }else{
          return res.json("No record existed")
      }
  })
}
 
)

// getting remote users in adminpage


app.get('/approve',async(req,res)=>{
  try{
    const users = await RemoteTutor.find({}).populate('commonAuth')
    res.json(users)

  }catch(error){
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})



// approve and rejection of remotetutors

app.put('/approve/:tutorId', async (req, res) => {
  try {
    const { tutorId } = req.params;
    await Collection.findByIdAndUpdate(tutorId, { status: 'approved' });
    res.status(200).json({ message: 'Tutor approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.put('/reject/:tutorId', async (req, res) => {
  try {
    const { tutorId } = req.params;
    await Collection.findByIdAndUpdate(tutorId, { status:'rejected' });
    res.status(200).json({ message: 'Tutor rejected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// getting students in adminpage



app.get('/students',async(req,res)=>{
  try{
    const users = await Student.find({}).populate('commonAuth')
    res.json(users)

  }catch(error){
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


// getting tutors in adminpage


app.get('/listtutors',async(req,res)=>{
  try{
    const users = await Tutor.find({}).populate('commonAuth')
    res.json(users)

  }catch(error){
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


// Admin adding Cars



app.post('/cars', async (req, res) => {
  const { id,type,vechicleno, model,color,rgno } = req.body;

  try {
    // Check if the email already exists in userauth
    const existingCar = await Car.findOne({ rgno:rgno });

    if (existingCar) {
      return res.json({ status: 'Car already exists' });
    }

  
    
    const car = await Car.create({
      id,
      type,
      vechicleno,
      model,
      color,
      rgno

    
    });

    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err.message);
    res.json(err);
  }
});


// getting all cars


app.get('/listcars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});







   // Assign the tutor to the student
      
      app.post('/assign-tutor/:studentId', (req, res) => {
        const { tutorId } = req.body;
        const { studentId } = req.params;
      
        Student.findByIdAndUpdate(studentId, { tutor: tutorId })
          .then(() => {
            res.status(200).json({ message: 'Tutor assigned successfully' });
          })
          .catch(err => {
            res.status(500).json({ error: 'Internal server error' });
          });
      })


 // students without tutor


      app.get('/students-without-tutor', (req, res) => {
        Student.find({ tutor: { $exists: false } }) 
          .then(students => {
            res.status(200).json(students);
          })
          .catch(err => {
            res.status(500).json({ error: 'Internal server error' });
          });
      });

// getting a particular car


      app.get('/getacar/:id', async (req, res) => {
        try {
            const car = await Car.findOne({ id: req.params.id });
            if (car) {
                res.status(200).json(car);
            } else {
                res.status(404).json({ error: 'Car not found' });
            }
        } catch (error) {
            console.error('Error fetching car:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

// edit car

    const editCar = (id, type, vechicleno, model, color, rgno) => {
      return Car.findOne({ id })
          .then((result) => {
              if (result) {
                  result.type = type;
                  result.vechicleno = vechicleno;
                  result.model = model;
                  result.color = color;
                  result.rgno = rgno;
                  return result.save()
                      .then(() => {
                          return {
                              statusCode: 200,
                              message: "Car updated successfully"
                          };
                      });
              } else {
                  return {
                      statusCode: 404,
                      message: "Car not found"
                  };
              }
          })
          .catch(error => {
              console.error('Error updating car:', error);
              return {
                  statusCode: 500,
                  message: "Internal server error"
              };
          });
  };
  
  app.post('/update-car', (req, res) => {
      const { id, type, vechicleno, model, color, rgno } = req.body;
      editCar(id, type, vechicleno, model, color, rgno)
          .then(result => {
              res.status(result.statusCode).json(result);
          });
  });
  

  // delete car


 
const removeCar = (id) => {
  return Car.findOneAndDelete({ id })
      .then((car) => {
          if (car) {
              return {
                  statusCode: 200,
                  message: "Car deleted successfully"
              };
          } else {
              return {
                  statusCode: 404,
                  message: "Car not found"
              };
          }
      })
      .catch(error => {
          console.error('Error deleting car:', error);
          return {
              statusCode: 500,
              message: "Internal server error"
          };
      });
};

app.delete('/delete-car/:id', (req, res) => {
  const { id } = req.params;
  removeCar(id)
      .then((result) => {
          res.status(result.statusCode).json(result);
      });
});




// getting a particular tutor


app.get('/getatutor/:id', async (req, res) => {
  try {
      const tutor = await Tutor.findOne({ id: req.params.id }).populate('commonAuth');
      if (tutor) {
          res.status(200).json(tutor);
      } else {
          res.status(404).json({ error: 'Car not found' });
      }
  } catch (error) {
      console.error('Error fetching car:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});



// edit tutor





app.post('/update-tutor', async (req, res) => {
  const { id, name, address, phone, email, idcard, username } = req.body;

  try {
      const tutor = await Tutor.findOne({ id });
      if (tutor) {
          // Find the corresponding user in the Collection model
          const user = await Collection.findById(tutor.commonAuth);
          if (user) {
              // Update Tutor model
              tutor.name = name;
              tutor.address = address;
              tutor.phone = phone;
              tutor.email = email;
              tutor.idcard = idcard;

              // Update Collection model
              user.username = username;

              // Save changes to both models
              await tutor.save();
              await user.save();

              console.log("Updated Tutor:", tutor);
              console.log("Updated User:", user);

              res.status(200).json({
                  statusCode: 200,
                  message: "Tutor and user updated successfully"

                  
              });
          } else {
              res.status(404).json({
                  statusCode: 404,
                  message: "User not found"
              });
          }
      } else {
          res.status(404).json({
              statusCode: 404,
              message: "Tutor not found"
          });
      }
  } catch (error) {
      console.error('Error updating tutor:', error);
      res.status(500).json({
          statusCode: 500,
          message: "Internal server error"
      });
  }
});





  // delete tutor


 
  const removeTutor = (id) => {
    return Tutor.findOneAndDelete({ id })
        .then((tutor) => {
            if (tutor) {
                return {
                    statusCode: 200,
                    message: "Tutor deleted successfully"
                };
            } else {
                return {
                    statusCode: 404,
                    message: "Tutor not found"
                };
            }
        })
        .catch(error => {
            console.error('Error deleting Tutor:', error);
            return {
                statusCode: 500,
                message: "Internal server error"
            };
        });
  };
  
  app.delete('/delete-tutor/:id', (req, res) => {
    const { id } = req.params;
    removeTutor(id)
        .then((result) => {
            res.status(result.statusCode).json(result);
        });
  });
  

  // tutorpanel with assigned students


  app.get('/assignedStudents/:userId', async (req, res) => {
      const { userId } = req.params;
      try {
          // Find the tutor document associated with the user's ID
          const tutor = await Tutor.findOne({ commonAuth: userId });
  
          if (!tutor) {
              return res.status(404).json({ error: 'Tutor not found' });
          }
  
          // Once you have the tutor document, retrieve the assigned students
          const assignedStudents = await Student.find({ tutor: tutor._id }).populate('commonAuth');
          res.json(assignedStudents);
      } catch (error) {
          console.error('Error fetching assigned students:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      }
  });
  


  // admin adding package


  
app.post('/package', async (req, res) => {
  const { id,type,packagename,descripition,amount } = req.body;

  try {
    // Check if the email already exists in userauth
    const existingpackage = await Package.findOne({ packagename:packagename });

    if (existingpackage) {
      return res.json({ status: 'Package already exists' });
    }

  
    
    const car = await Package.create({
      id,
      type,
      packagename,
     descripition,
      amount

    
    });

    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err.message);
    res.json(err);
  }
});



  // get all packages


  app.get('/listpackages', async (req, res) => {
    try {
      const packages = await Package.find();
      res.json(packages);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });




  // getting a particular package


  app.get('/getapackage/:id', async (req, res) => {
    try {
        const pack = await Package.findOne({ id: req.params.id });
        if (pack) {
            res.status(200).json(pack);
        } else {
            res.status(404).json({ error: 'Package not found' });
        }
    } catch (error) {
        console.error('Error fetching Package:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


  // edit package

  const editPackage = ( id,type,packagename, descripition,amount) => {
    return Package.findOne({ packagename:packagename })
        .then((result) => {
            if (result) {
                result.type = type;
                result.packagename = packagename;
                result.descripition=  descripition;
                result.amount = amount;
                return result.save()
                    .then(() => {
                        return {
                            statusCode: 200,
                            message: "Package updated successfully"
                        };
                    });
            } else {
                return {
                    statusCode: 404,
                    message: "Package not found"
                };
            }
        })
        .catch(error => {
            console.error('Error updating Package:', error);
            return {
                statusCode: 500,
                message: "Internal server error"
            };
        });
};

app.post('/update-package', (req, res) => {
    const {id,type,packagename, descripition,amount } = req.body;
    editPackage(id,type,packagename, descripition,amount)
        .then(result => {
            res.status(result.statusCode).json(result);
        });
});




  // delete Package


 
  const removePackage = (id) => {
    return Package.findOneAndDelete({ id })
        .then((pack) => {
            if (pack) {
                return {
                    statusCode: 200,
                    message: "Package deleted successfully"
                };
            } else {
                return {
                    statusCode: 404,
                    message: "Package not found"
                };
            }
        })
        .catch(error => {
            console.error('Error deleting Package:', error);
            return {
                statusCode: 500,
                message: "Internal server error"
            };
        });
  };
  
  app.delete('/delete-package/:id', (req, res) => {
    const { id } = req.params;
    removePackage(id)
        .then((result) => {
            res.status(result.statusCode).json(result);
        });
  });
  
  
  //  Selection of package by local student


app.post('/:id/select-package', async (req, res) => {
  const collectionId = req.params.id;
  const { packageId } = req.body;

  try {
    // Find the student by Collection ID
    const student = await Student.findOne({ commonAuth: collectionId }).populate('selectedPackages');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the package is already selected by the student
    const selectedPackage = student.selectedPackages.find(pack => pack._id.equals(packageId));
    if (selectedPackage) {
      return res.status(400).json({ message: 'Package is already selected' });
    }

    // Update the selectedPackages field for the student
    student.selectedPackages.push(packageId);
    await student.save();

    res.status(200).json({ message: 'Package selected successfully' });
  } catch (error) {
    console.error('Error selecting package:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


  //  Selection of package by Remote student


  app.post('/:id/selectpackage', async (req, res) => {
    const collectionId = req.params.id;
    const { packageId } = req.body;
  
    try {
      // Find the student by Collection ID
      const student = await RemoteStudent.findOne({ commonAuth: collectionId }).populate('selectedPackages');
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      // Check if the package is already selected by the student
      const selectedPackage = student.selectedPackages.find(pack => pack._id.equals(packageId));
      if (selectedPackage) {
        return res.status(400).json({ message: 'Package is already selected' });
      }
  
      // Update the selectedPackages field for the student
      student.selectedPackages.push(packageId);
      await student.save();
  
      res.status(200).json({ message: 'Package selected successfully' });
    } catch (error) {
      console.error('Error selecting package:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });





app.get('/:id/selected-packages', async (req, res) => {
  const collectionId = req.params.id;

  try {
    // Find the student by Collection ID
    const student = await Student.findOne({ commonAuth: collectionId }).populate('selectedPackages');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student.selectedPackages);
  } catch (error) {
    console.error('Error fetching selected packages:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});




app.get('/:id/selectedpackages', async (req, res) => {
  const collectionId = req.params.id;

  try {
    // Find the student by Collection ID
    const student = await RemoteStudent.findOne({ commonAuth: collectionId }).populate('selectedPackages');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student.selectedPackages);
  } catch (error) {
    console.error('Error fetching selected packages:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});




  // admin adding session


  
  app.post('/session', async (req, res) => {
    const { id,sessionname,descripition,date,duration } = req.body;
  
    try {
      // Check if the email already exists in userauth
      const existingpackage = await Session.findOne({ sessionname:sessionname});
  
      if (existingpackage) {
        return res.json({ status: 'Session already exists' });
      }
  
    
      
      const Ses = await Session.create({
        id,
        sessionname,
       descripition,
        date,
        duration
  
      
      });
  
      res.json({ status: 'ok' });
    } catch (err) {
      console.error(err.message);
      res.json(err);
    }
  });
  




  



app.get('/parti/:id', async (req, res) => {
  try {
    const collectionId = req.params.id;
    const student = await RemoteStudent.findOne({ commonAuth: collectionId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});






// tutor session


app.get('/tutorsession', async (req, res) => {
  try {
    const sessions = await Session.find();
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// particular tutor id

app.get('/partitut/:id', async (req, res) => {
  try {
    const collectionId = req.params.id;
    const tutor = await RemoteTutor.findOne({ commonAuth: collectionId });
    if (!tutor) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ tutor });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// session selecting by remote tutor



app.post('/:sessionId/addTutor', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { tutorId } = req.body;

    // Find the session by ID
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check if session is already assigned to the same tutor
    if (session.tutor && session.tutor.toString() === tutorId) {
      return res.status(400).json({ success: false, message: 'Session is already assigned to this tutor' });
    }

    // Check if session is already assigned to another tutor
    if (session.tutor && session.tutor.toString() !== tutorId) {
      return res.status(400).json({ success: false, message: 'Session is already assigned to another tutor' });
    }

    // Check if session is from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (session.date <= yesterday) {
      return res.status(400).json({ success: false, message: 'Cannot select past sessions' });
    }

    // Update the session's tutor reference
    session.tutor = tutorId;

    // Save the updated session
    await session.save();

    res.json({ success: true, message: 'Tutor added to session successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});





// Backend route to fetch sessions visible to remote students
app.get('/sessions/visible', async (req, res) => {
  try {
    // Fetch sessions where tutor is selected (not null)
    const sessions = await Session.find({ tutor: { $ne: null } })
                                   .populate('tutor')
                                   .populate('selectedStudents');
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/sessions/:sessionId/select/:studentId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if session date is today or in the future
    const sessionDate = new Date(session.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today) {
      return res.status(400).json({ message: 'Cannot select past sessions' });
    }

    const studentId = req.params.studentId;

    // Check if session is already selected by the student
    const isAlreadySelected = session.selectedStudents.includes(studentId);
    if (isAlreadySelected) {
      return res.status(400).json({ message: 'Session already selected' });
    }

    // Check if the maximum number of students has been reached
    if (session.selectedStudents.length >= 1) {
      return res.status(400).json({ message: 'Maximum number of students already selected for this session' });
    }

    // Add student ID to selectedStudents array
    session.selectedStudents.push(studentId);
    await session.save();

    // Send success response with an alert message
    res.json({ message: 'Session selected successfully. You have been added to the session.' });
  } catch (error) {
    console.error('Error selecting session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/sessions/selected/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const sessions = await Session.find({ selectedStudents: studentId }).populate('tutor');
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching selected sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.put('/sessions/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Update the completion status of the session
    session.finished = req.body.finished;
    await session.save();

    res.json({ message: 'Session completion status updated successfully' });
  } catch (error) {
    console.error('Error updating session completion status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/sessions/completed/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const sessions = await Session.find({ selectedStudents: studentId, finished: true }).populate('tutor');
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching completed sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// to get particular tutor from session

app.get('/tutorsessions/:sessionId', async (req, res) => {
  try {
      const sessionId = req.params.sessionId;
      // Find session details by session ID
      const session = await Session.findById(sessionId);
      if (!session) {
          return res.status(404).json({ error: 'Session not found' });
      }
      // Respond with session details
      res.json({
          sessionId: session._id,
          tutorId: session.tutor // Assuming tutor ID is stored in the 'tutor' field of the session document
          // Add other session details as needed
      });
  } catch (error) {
      console.error('Error fetching session details:', error);
      // Respond with error message
      res.status(500).json({ error: 'Failed to fetch session details' });
  }
});




// app.post('/ratings', async (req, res) => {
//   try {
//       // Extract rating data from request body
//       const { session, tutor, student, sessionRating, tutorRating } = req.body;

//       // Create a new Rating document
//       const newRating = new Rating({
//           session,
//           tutor,
//           student,
//           sessionRating,
//           tutorRating
//       });

//       // Save the rating to the database
//       await newRating.save();

//       // Respond with success message
//       res.status(201).json({ message: 'Rating submitted successfully' });
//   } catch (error) {
//       console.error('Error submitting rating:', error);
//       // Respond with error message
//       res.status(500).json({ error: 'Failed to submit rating' });
//   }
// });



app.post('/ratings', async (req, res) => {
  try {
    // Extract rating data from request body
    const { session, tutor, student, sessionRating, tutorRating } = req.body;

    // Check if a rating already exists for the given session and student
    const existingRating = await Rating.findOne({ session, student });

    if (existingRating) {
      // If a rating already exists, you can choose to update it or reject the new rating
      return res.status(400).json({ error: 'Rating already exists for this session and student' });
    }

    // Create a new Rating document
    const newRating = new Rating({
      session,
      tutor,
      student,
      sessionRating,
      tutorRating
    });

    // Save the rating to the database
    await newRating.save();

    // Respond with success message
    res.status(201).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating:', error);
    // Respond with error message
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});



app.get('/tutorsessions/selected/:tutorId', async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    const sessions = await Session.find({ tutor: tutorId}).populate('tutor');
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching selected sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/ratings/:tutorId', async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    // Find ratings associated with the tutor ID
    const tutorRatings = await Rating.find({ tutor: tutorId }).populate('session');
    res.json(tutorRatings);
  } catch (error) {
    console.error('Error fetching tutor ratings:', error);
    res.status(500).json({ error: 'Failed to fetch tutor ratings' });
  }
});



app.get('/tutorprofile/:id', async (req, res) => {
  try {
    const tutorId = req.params.id;
    const tutor = await Tutor.findOne({ commonAuth: tutorId }).populate('commonAuth');
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    res.json(tutor);
  } catch (error) {
    console.error('Error fetching tutor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





app.get('/remotetutorprofile/:id', async (req, res) => {
  try {
    const tutorId = req.params.id;
    const tutor = await RemoteTutor.findOne({ commonAuth: tutorId }).populate('commonAuth');
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    res.json(tutor);
  } catch (error) {
    console.error('Error fetching tutor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




app.get('/ratings', async (req, res) => {
  try {
    // Fetch ratings along with session and tutor details
    const ratings = await Rating.find({})
      .populate('session')
      .populate('tutor')
      .populate('student');

    res.json({ success: true, ratings });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




