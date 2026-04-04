const express= require('express');
const app= express();
const port=5000;
const path= require('path');
const mysql= require('mysql2');
const { Console } = require('console');


// Database Connection 
const conn= mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'Attendence_Management',
    password: 'mysql@2006'
});

try{
    conn.query("SHOW TABLES", (err,result)=>{
        if(err) throw err;
        console.log(result)
    })
}
catch(err){
    console.log(err);
}

app.set('views', path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/css")))

app.get("", (req, res)=>{
    res.render('teacher_login.ejs');
})

app.use(express.urlencoded({extended:true}));
app.use(express.json());


//Login Page
app.post("/teacher_details", (req, res)=>{
    let {Teacher_Id:sampleTeacher_id, Password:samplePassword}= req.body;

    console.log(`teacher id ${sampleTeacher_id}`);
    console.log(`password ${samplePassword}`);
    // // DataBase

    
    let q=`Select * From teacher where Teacher_id= ?`;
    try{
        conn.query(q, [sampleTeacher_id],(err, result)=>{
            if(err) throw err;

            if(result.length > 0){
                console.log(result.length);
                console.log('Got Id');
                // console.log(`From DB ${typeof(result[0].Teacher_Id)}`);
                // console.log(`From DB ${typeof(result[0].Password)}`)
                // console.log(`sample pass: ${typeof(samplePassword)}`);


                // Validation of password
                if(samplePassword==result[0].Password){
                    console.log("Password is correct you can take attendence")/
                    // res.send("here is your detail ")
                    res.render("teacher_details.ejs",{ name: result[0].Name,
                                Teacher_Id: result[0].Teacher_Id,
                                Phone_No: result[0].Phone_No});
                }
                else{
                    console.log("incorrect password")
                }
                
            }
            else{
                console.log("Not got the id")
            }
                
        })


    }
    catch(err){
            console.log("Error")
    }
})

app.get('/', (req, res)=>{
    res.send("Welcome to IIT Ranchi")
})


// Attendence form 
app.post("/teacher_details/Attendence_form", (req, res)=>{
    let {Teacher_Id}= req.body;
    console.log('Teacher Details', req.body);
    console.log("Teacher_Id received:", Teacher_Id);

    // q=`SELECT Name from teacher where Teacher_id= ?`
    q=`SELECT t.Teacher_ID, t.Name, CONCAT(b.StartYear, '-', b.EndYear) As Batch, c.courseName, s.sectionName,sem.semID
        from teacher_assignment as a
        JOIN teacher as t 
            ON t.Teacher_ID= a.Teacher_Id
        JOIN Batch as b
            ON b.BatchId = a.BatchId
        JOIN Course as c
            ON c.CourseId= a.courseId
        JOIN Section as s 
            ON s.SectionId= a.SectionId
        Join Semester as sem
            ON sem.semID= a.semId
        WHERE a.Teacher_Id= ?`

    try{
        conn.query(q,[Teacher_Id],(err, result)=>{
            if(err) throw err;
            console.log("From Attendance form", result);
            Batches=[]
                for(let i of result){
                    Batches.push(i.Batch);
                }
            courses=[]
                for(let i of result){
                    courses.push(i.courseName);
                }
            sections=[];
                for(let i of result){
                    sections.push(i.sectionName)
                }
            semesters=[]
                for(let i of result){
                    semesters.push(i.semID);
                }
            console.log(Batches);
            console.log(sections);
            console.log(courses);
            console.log(result[0].Name);
            console.log(semesters);
            res.render("Attendence_form.ejs", {name: result[0].Name,Teacher_ID: result[0].Teacher_ID,
                                                Batches,sections,courses,semesters,                               
            });
        })
    }catch(err){
        console.log(err);
    }
})




// Student List Route
app.post("/teacher_details/Attendence_form/Student_List", (req,res)=>{
    let {Batch, Teacher_ID, Course, semester,section}= req.body;
    console.log("From Student",req.body);

    // console.log(typeof(Batch));
    // q=`Select RollNumber, CourseId`
    // let StartYear= [];
    // let i=0;
    // while(i!="-"){
    //     StartYear=Batch[i];
    //     i++;
    // }
    
    let parts=Batch.split('-')
    let StartYear=parts[0];
    let EndYear=parts[1];

    console.log(StartYear);
    console.log(EndYear);
    
    console.log("Before q2",Teacher_ID);

    q=`Select s.StudentId,s.RollNumber, s.StudentName, sec.sectionname,b.startyear, b.endyear, c.coursename
        from students as s
        Join Batch as b
        ON b.BatchId= s.BatchId
        Join course as c
        ON c.CourseId = s.CourseId
        Join section as sec
        ON sec.sectionId=s.sectionId
        where b.StartYear=${StartYear} and b.EndYear=${EndYear} and c.CourseName=? and sec.sectionname=? ;`

        let q2=`Select name from teacher
                where Teacher_ID=? ;`


        // console.log(q);

        try{
            conn.query(q,[Course,section],(err,result)=>{
                if(err) throw err ;
                // console.log(result);
                let SId=[];
                for(let i of result){
                    SId.push(i.StudentId);
                }
                let RollNos=[]
                for(let i of result){
                    RollNos.push(i.RollNumber);
                }
                let Snames=[];
                for(let i of result){
                    Snames.push(i.StudentName);
                }
                console.log(RollNos);
                console.log(Snames);
                // console.log("Me",Teacher_ID);

                conn.query(q2,[Teacher_ID], (err,result)=>{
                        if(err) throw err;
                        console.log("For Teacher ID",result);
                        res.render("Student_List.ejs", {Batch,Course,semester,section,
                                                    SId,RollNos,Snames,TeacherName: result[0].name
                        });
                    });
                
            })
        }
        catch(err){
            console.log(err);
        }

})

// server
app.listen(port, ()=>{
    console.log(`app is listening at port ${port}`);
})